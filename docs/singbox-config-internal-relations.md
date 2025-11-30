# Sing-box JSON Config: Smart Auto-Completion & Field Dependency Analysis

## Fields Referencing Other Config Items (Tags & Reference Paths)

Many configuration fields in *sing-box* use **tags or names to reference other config sections**, enabling internal linking. Below are key reference relationships and their paths:

- **Inbound/Outbound Tags in Routing:** Each inbound and outbound can have a `"tag"` (identifier). Route rules then use these tags to direct traffic. For example, a route rule’s `"inbound"` field can list one or more inbound tags to match traffic from those inbounds, and its `"outbound"` field specifies an outbound tag for matched traffic. In the JSON, this looks like:

&nbsp;

- "route": {
        "rules": [
          { "inbound": ["mixed-in"], "port": 53, "outbound": "dns-out" }
        ]
      }

  In this example, `"mixed-in"` is the tag of an inbound, and `"dns-out"` is the tag of an outbound. The rule sends port 53 traffic from inbound *mixed-in* to outbound *dns-out*. **Intellisense tip:** when editing a route rule, the editor can suggest inbound tags for `"inbound"` (from defined inbounds) and outbound tags for `"outbound"` (from defined outbounds) to ensure valid references.

&nbsp;

- **Default Outbound for Routing (final):** The top-level `route.final` field also uses an outbound tag to specify the **default outbound** for traffic that doesn’t match any rule. If `final` is empty, sing-box will use the first outbound by default. *Autocomplete can suggest* either an explicit tag (from your outbounds list) or an empty value (meaning “use first outbound”) for this field.

- **Chained/Selectable Outbounds:** Some outbound types reference other outbounds by tag:

- **Selector outbound:** an outbound of `"type": "selector"` contains an `"outbounds"` array of outbound tags to choose from, plus an optional `"default"` tag. For instance:

&nbsp;

- { "type": "selector", "tag": "select-proxy",
        "outbounds": ["proxy-a", "proxy-b", "proxy-c"],
        "default": "proxy-c" }

  Here `"proxy-a"`, `"proxy-b"`, `"proxy-c"` must correspond to tags of actual outbounds defined elsewhere. The `"default"` should be one of those tags (if omitted, the first in the list is used by default). **Autocomplete** for the `"outbounds"` list can present all available outbound tags, and for `"default"` can present that same list (plus an empty option to signify the first).

&nbsp;

- **URLTest outbound:** similarly has an `"outbounds"` array of tags to test and pick from. Intellisense should behave like the selector case, suggesting known outbound tags.

- **DNS Server References:** In the `dns` section, each DNS server entry may have a `"tag"`. Other fields then reference these:

- `dns.final` can be set to a DNS server tag to specify which DNS server to use as the **default** (if empty, the first server in the list is used).

- DNS routing rules (in `dns.rules`) can use an action of `"route"` with a `"server"` field to direct queries to a specific DNS server by its tag. For example, an action `{ "action": "route", "server": "secure-dns" }` would send matching queries to the DNS server tagged “secure-dns.” **Autocomplete** for these fields (`dns.final` or a DNS rule’s `"server"`) should list the tags of servers defined under `dns.servers`.

- **Rule Set Download Outbound:** When using remote rule sets (`route.rule_set` of type `"remote"`), the optional `"download_detour"` field is a tag of an outbound to use as a proxy for downloading the rule file. If empty, the default outbound is used. Intellisense can suggest any defined outbound tag here (commonly one that provides Internet connectivity for downloads).

> **Dependency Note:** The config **does not auto-derive these references** – you must ensure the tag strings match actual defined entries. A good editor can help by suggesting or auto-completing tag values from the current config context. This prevents typos and broken links. For example, if you have outbounds with tags `"vpn"` and `"direct"`, then typing `"outbound": "` in a route rule could prompt with `"vpn"` and `"direct"` as suggestions. Similarly, editing `dns.final` could suggest the tags of your DNS servers (e.g., `"cloudflare"` if you tagged one DNS server as such).

Below is a summary table of **cross-reference fields** and their expected values, with suggestions for autocomplete:

| **Field (context)** | **References / Must match** | **Intellisense Suggestions** |
|----|----|----|
| `inbounds[i].tag` | Referenced by route rules in `"inbound"` filters. Used to identify an inbound in rules. | Suggest from defined inbound tags in config. |
| `outbounds[j].tag` | Referenced by route rules (`"outbound"` field), `route.final`, and by selector/urltest outbounds. Marks an outbound target. | Suggest from defined outbound tags. |
| `dns.servers[k].tag` | Referenced by `dns.final` and DNS rules (`action.server`) to select a DNS server. | Suggest from defined DNS server tags. |
| `route.final` | Outbound tag to use for unmatched traffic. (Empty = use first outbound.) | Suggest outbound tags (plus option for empty/default). |
| `route.rules[].outbound` | Outbound tag to route matching traffic (when `action = "route"`). Must match an outbound’s tag. | Suggest from outbound tags. |
| `route.rules[].inbound` | Inbound tag or list of tags to match traffic source. Must match an inbound’s tag. | Suggest from inbound tags. |
| `rule_set.remote.download_detour` | Outbound tag used as proxy for downloading rule-set files. (Empty = default outbound.) | Suggest from outbound tags. |
| *Other references* | *E.g. possibly endpoint names, if used in future or certain services.* | *(Handled similarly via tag suggestions.)* |

## Fixed-Value Fields (Protocols) and Their Influence on Substructure

Some fields have **fixed sets of allowed values** (enums) that determine what sub-fields or structure are expected next. The most important is the `"type"` (or protocol) field for various components, which dictates which child fields are valid or required:

- **Inbound/Outbound** `type`**:** Each inbound or outbound entry must specify a `"type"` indicating the protocol or handler. This is a fixed enumeration – for example, inbound types include `direct`, `mixed`, `socks`, `http`, `shadowsocks`, `vmess`, `trojan`, `naive`, `hysteria`, `shadowtls`, `vless`, `tuic`, `hysteria2`, `anytls`, `tun`, `redirect`, `tproxy` (among others). Outbound types include `direct`, `block`, `socks`, `http`, `shadowsocks`, `vmess`, `trojan`, `wireguard`, `hysteria`, `shadowtls`, `vless`, `tuic`, `hysteria2`, `anytls`, `tor`, `ssh`, `dns`, `selector`, `urltest`. These values are **pre-defined constants** – if you set an invalid value, the config will be rejected. **Autocomplete should provide the list of valid types** when you begin writing a `"type"` field. Selecting a type will narrow down which sub-fields are applicable next.

- **Effect on Sub-fields:** The chosen `type` of an inbound/outbound **directly influences what fields are expected inside that object**. In the JSON docs, each protocol has its own structure definition. For example:

- If you set an **inbound** `"type": "shadowsocks"`, the inbound must include Shadowsocks-specific fields like `"method"` (encryption cipher) and `"password"` (credentials). Those fields are not used for other types like SOCKS or HTTP, so they appear only in a Shadowsocks context. The editor can automatically prompt for `"method"` and `"password"` once `type: "shadowsocks"` is chosen. (It could even suggest cipher method values – e.g. `aes-128-gcm`, `2022-blake3-aes-128-gcm`, etc., as those are a fixed set of cipher names.) If any required sub-field is missing, the configuration is incomplete for that protocol.

- If `"type": "vmess"` on an **inbound** (VMess server), you must provide a list of client accounts under `"users"` – each with a `"uuid"` (and optionally other VMess settings). By contrast, a **VMess outbound** (client) would require fields like `"server"`, `"server_port"`, and a `"uuid"` for authentication. An editor aware of this can auto-insert a template of required fields for VMess after you choose it as the type.

- If `"type": "trojan"` on an **outbound** (Trojan client), required fields include the `"server"` address, `"server_port"`, and `"password"` for the Trojan connection. An **inbound** Trojan server uses a `"users"` list of allowed passwords (similar to Shadowsocks) and can optionally define `"fallback"` addresses for non-proxy traffic. These fields (passwords, fallbacks) are only valid under Trojan and will be suggested only in that context.

- Other protocols have analogous requirements: e.g. **WireGuard outbound** needs keys and peer information (private key, peer public key, allowed IPs, etc.), **Hysteria** needs a auth token or password and certain transport parameters, **VLESS** requires a UUID (and possibly encryption set to "none" or XTLS flow settings), **TUIC** requires a password and congestion control options, etc. Each of these protocols corresponds to a fixed schema. **Intellisense should be context-sensitive** – once a `type` is selected, the UI can present the valid sub-fields for that protocol (and even mark which are required). This not only speeds up editing but also prevents mistakes (e.g. adding an unsupported field under a given type).

- **Protocol Example – Shadowsocks:** The `"protocol"` (type) is fixed to `"shadowsocks"` and implies a specific set of child fields. As noted, you **must** include `"method"` and `"password"` for a Shadowsocks inbound/outbound. Additionally, Shadowsocks supports optional settings like `"network"` or UDP-specific options in some cases. The documentation shows that *if* the Shadowsocks server enables UDP, it might use a `"network"` field (`"tcp"`, `"udp"`, or both), and if UDP is enabled, a `"udp_over_tcp"` multiplex setting could be used (sing-box allows carrying UDP over TCP for SS for obfuscation). An intelligent editor could, for instance, default `"network"` to `"tcp"` for Shadowsocks (common case) but suggest `"udp"` or `"tcp,udp"` if desired, and if `"udp"` is included, remind the user about configuring FakeDNS or UDP fallback if needed. (This kind of deep guidance may go beyond basic JSON schema, but is possible with custom rules.)

- **Enumerated Values in Other Fields:** Many other fields in the config have fixed sets of values which Intellisense can suggest:

- `log.level`**:** One of `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `panic`. These represent logging verbosity. The config will only accept those strings. A schema can enumerate them so the editor shows a drop-down of valid levels.

- `dns.strategy`**:** How DNS resolves IP families. Allowed values are `prefer_ipv4`, `prefer_ipv6`, `ipv4_only`, or `ipv6_only`.

- `network` **fields:** Many inbounds/outbounds that deal with lower-level sockets have a `"network"` or `"networks"` field limiting to `tcp`, `udp`, or both. For example, the `direct` inbound (which forwards packets) has `"network": "tcp"` or `"udp"` (or an array `["tcp","udp"] for both)`. The presence of certain sub-fields can depend on this value. In the Direct inbound, if you choose`"udp"`, you can also set an`"override_address"`and`"override_port"`to redirect UDP packets to a specific target (commonly used for DNS hijacking). Those override fields wouldn’t apply if the network is`"tcp"`. A smart schema could use an`if/then`rule: if network == udp, make override fields available. At minimum, the editor should restrict the`"network"\` field to valid options and hint at the meaning (e.g. tooltips: *“tcp = only forward TCP, udp = only UDP, tcp,udp = both”*).

- `route.rules[].action`**:** The routing action field is an enum. *Final actions* in sing-box routing include `"route"` (proxy through an outbound), `"reject"` (block/drop the connection), and `"hijack-dns"` (intercept DNS queries to the internal DNS). *Non-final* (combinable) actions like `"route-options"`, `"sniff"`, `"resolve"` exist for advanced rule tweaks. Each action value dictates what other fields appear:
  - If `action: "route"`, you **must** provide an `"outbound"` (the tag of the target outbound). The schema marks `"outbound"` as **Required** in this case. Intellisense should flag if you forget it.
  - If `action: "reject"`, you can optionally specify a `"method"` (`"default"` vs `"drop"` vs `"icmp"` variants) and a `"no_drop"` flag. These only make sense for reject; the editor should offer them only when `reject` is chosen.
  - If `action: "hijack-dns"`, no additional fields are needed (it simply directs DNS to the internal resolver). The editor can note that no further input is required in this case.
  - If `action: "resolve"`, it accepts fields like `"server"` (DNS server tag to use for this lookup) and strategy flags – which mirror those under `dns` – only applicable in this context.
  - **Autocomplete** here should present the list of allowed actions, and upon selection, surface the relevant sub-fields. For instance, choosing `"route"` would prompt for an `"outbound"` value (and ideally suggest outbound tags as discussed), while choosing `"reject"` could show a dropdown for `"method"` values (`default/drop/reply`) etc.

In summary, wherever a field has a **limited set of valid inputs, those inputs can be enumerated for Intellisense**. This covers protocol types, strategy flags, log levels, cipher names, etc. Choosing one of these values often **constrains or enables other fields**, which a good schema or language server can handle via conditional schemas or snippets. Below is a table highlighting some of these **protocol/value dependencies**:

| **Context or Field** | **Allowed Values / Requirements** | **Autocomplete Behavior** |
|----|----|----|
| **Inbound** `"type"` **/ Outbound** `"type"` | *Enumerated protocol type.* Examples: `direct`, `socks`, `http`, `shadowsocks`, `vmess`, `trojan`, `wireguard`, `hysteria`, `vless`, `tuic`, etc. | Editor suggests all valid types. Once selected, only the fields relevant to that type are allowed/shown. |
| **Shadowsocks config** | Requires `"method"` (cipher) and `"password"` fields when type is shadowsocks. (Optional: `"network"` and multiplex settings.) | On choosing *shadowsocks*, auto-add required fields. Provide dropdown for `"method"` (known cipher names) and indicate `"password"` as required. |
| **VMess config** | **Client (outbound):** requires `"server"`, `"server_port"`, and an `"id"` (UUID). **Server (inbound):** requires a `"users"` list with each user’s `"uuid"`. | If type=vmess, suggest a template: for outbound, fields for address, port, id; for inbound, an array structure for users. Validate UUID format and possibly suggest generation. |
| **Trojan config** | **Client:** requires `"server"`, `"server_port"`, `"password"`. **Server:** requires at least one password in a `"users"` list. Can optionally set `"fallback"` destinations for non-TLS or unknown ALPN. | If type=trojan, prompt for server, port, and password(s). If adding *fallback*, require its subfields (`server`, `server_port`). |
| **Selector/URLTest outbound** | `"outbounds"` must be an array of existing outbound tags; `"default"` (for selector) should be one of those or empty (meaning first). | Provide multi-select or checklist of outbounds for `"outbounds"` array. For `"default"`, suggest one of those tags. |
| **Route rule** `"action"` | Enum: e.g. `route`, `reject`, `hijack-dns`, `sniff`, `resolve`. Each value enables specific sub-fields (see text above). | Suggest allowed actions. On selection, automatically insert or enable the needed sub-fields (e.g. add an `"outbound": ""` placeholder if `action: "route"`). Provide value suggestions for sub-fields (e.g. reject `method`). |
| **Route** `"outbound"` **(if action=route)** | Must be set to a valid outbound tag. (No effect for other actions.) | Suggest outbound tags (from config) when editing this field. Flag as required when `action="route"`. |
| **DNS server** `"type"` | Enum of DNS resolver types: e.g. (empty = legacy), `local`, `hosts`, `tcp`, `udp`, `tls`, `https`, `quic`, `fakeip`, etc. Each type expects certain fields (e.g. `address` for network-based types, or none for `local`). | Suggest valid DNS server types. After choosing, prompt for the fields that type needs (e.g. if `type: "tls"`, suggest `"address"` (DoT URI) and optional certificate verification settings). If `type: "local"` or `hosts`, no address needed – editor can hide irrelevant fields. |
| **DNS** `"strategy"` | Enum: `prefer_ipv4`, `prefer_ipv6`, `ipv4_only`, `ipv6_only` (controls DNS A/AAAA query preference) | Suggest these four values with descriptions. |
| **Log** `"level"` | Enum: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `panic` | Suggest these constants. Possibly warn if a non-standard string is typed. |
| **Other enums/flags** | *Numerous others:* e.g. `network` = `tcp`/`udp` (as noted), `tls.alpn` (list of application protocols), `tls.version` min/max (e.g. `1.2`, `1.3`), `multiplex.enabled` (true/false), etc. These have either fixed sets or boolean values that influence behavior. | The schema can enumerate or type-restrict these. Intellisense can show the valid options or boolean toggles. If a flag enables a feature (e.g. enabling `"multiplex"`), the editor can then show the nested options for that feature. |

*(The above are just key examples; the* sing-box *schema defines specific fields for each protocol. Ensuring the editor’s suggestions align with the official schema is crucial for accuracy.)*

## Context-Dependent Relationships Between Fields

Beyond simply having required fields, there are **conditional dependencies** – i.e. a field’s value not only enables certain sub-fields but might constrain values of another field. We’ve touched on many of these, but to recap and highlight a few important ones:

- **Mutually Dependent Fields for Protocols:** When a certain protocol type is chosen, some fields become mandatory and others irrelevant. For instance, if an outbound is of type `"dns"` (an outbound that answers DNS queries), the config will ignore fields like `"server"` or `"password"`, but it may require a `"tag"` (so it can be referenced in route rules) and perhaps no other fields (the DNS outbound is essentially an alias to use the internal DNS resolver). Conversely, an outbound of type `"ssh"` (SSH proxy) will need an `"user"` and key/password fields but not the typical proxy fields. The intellisense engine should know these nuances: it could, for example, gray-out or omit irrelevant fields for a given `type` to prevent confusion.

- **Exclusive or Conditional Subsections:** Some protocols have **sub-modes** indicated by a field value. For example, **Trojan inbound** allows a `"fallback"` and `"fallback_for_alpn"` to redirect non-proxy traffic. If you define `fallback_for_alpn` (a map of ALPN strings to fallback addresses), then any TLS client ALPN not in that map will be rejected. If you define a general `fallback`, it catches all unmatched cases. In practice, if the user starts adding a `fallback_for_alpn` object, the editor could hint that `"fallback"` (general fallback) is overridden by this and is optional, and guide the user to provide a mapping of ALPN (like `"http/1.1"` or `"h2"`) to addresses. This is a higher-level dependency that goes beyond static schema – it’s about understanding how one setting affects another. Documentation notes like “Disabled if `fallback` and `fallback_for_alpn` are empty” give clues; an advanced intellisense might incorporate such logic as user tips.

- **TLS and Certificate Settings:** Many inbounds/outbounds can have a `"tls"` sub-object to enable TLS. Whether you need to provide a certificate depends on context: on **server-side inbounds** (like trojan/vless servers), you must either provide a certificate (`"certificate"`/`"key"` fields or a path) or configure ACME (Automated Certificate via `"tls.acme"` settings). On **client-side outbounds**, you may instead specify `"server_name"` (SNI) and whether to `"insecure"`-ly skip cert verification. These fields are only relevant if TLS is enabled (`tls.enabled: true`). A JSON schema can use a boolean flag to conditionally require certificate fields when `enabled` is true and the config role is server. For autocompletion, once you turn on TLS, the editor should suggest the appropriate fields: for a server, it might suggest adding `"certificate_path"`/`"key_path"` or an ACME config; for a client, it might suggest `"server_name"` and perhaps toggle for certificate verification. This context-driven suggestion ensures the user isn’t overwhelmed with irrelevant TLS options when TLS is off, but gets necessary guidance when TLS is on.

- **Transport & Multiplexing Dependencies:** Sing-box supports specifying a custom transport layer (for VMess, VLESS, etc) via a `"transport"` object (e.g. WebSocket, HTTP/2, gRPC, QUIC). Inside `"transport"`, a `"type"` field selects the transport protocol, and that in turn dictates its sub-fields. For example, if `transport.type = "ws"` (WebSocket), you can have `"path"` and `"headers"`; if `type = "http"`, you might have `"host"` and `"path"`; if `type = "grpc"`, there’s a `"service_name"`, etc. An editor can cascade these suggestions: once you add a `"transport": { "type": "ws" }`, it should offer to add a `"path": "/your/path"` and maybe a `"headers": { ... }` object. Similarly, enabling **multiplexing** (`"multiplex": { "enabled": true, ... }`) will allow fields like `"max_streams"` (if configurable) or others to appear. If `enabled` is false or the whole `"multiplex"` section is omitted, those sub-settings are moot. The intellisense can handle this by only revealing `"multiplex"` options when appropriate (or by auto-hiding them when `enabled: false`). In the TypeScript type definitions for sing-box, for example, any `enabled` field must be true if present, otherwise the section should be omitted – an intelligent validator could enforce that rule and suggest removal of a disabled section.

- **Contextual Defaults:** Some fields take effect only in certain contexts or have defaults that depend on other settings. For instance, `dns.query_strategy` (if present) might override per-server strategy, or `outbound.bind_interface` overrides the global `route.auto_detect_interface` default route setting. While these aren’t direct “autocomplete” issues, an IDE might warn the user if they set contradictory options. For example, if `auto_detect_interface` is true globally but then the user sets a specific `bind_interface` on an outbound, that outbound will ignore the auto-detect. Such interactions could be noted in hover tooltips.

**Key context dependencies to remember for Intellisense:**

- **Protocol-specific mandatory fields:** As listed, each protocol (`type`) has a set of required fields (credentials, server info, etc.). The editor should prompt for all of these when a protocol is chosen. (E.g. no leaving out the `"password"` for Shadowsocks, or the `"uuid"` for VMess.)

- **Mutually exclusive choices:** Some config sections offer multiple ways to do something, but only one should be used at a time. For example, in the `certificate` section for TLS, you can either embed a cert with `"certificate"` (PEM lines) **or** provide a file path via `"certificate_path"`, **or** use ACME automation – but you wouldn’t use all at once. A schema can’t fully enforce “only one of these three”, but an editor could at least inform the user. Similarly, for outbound selectors you have either the older `urltest` method or the new `ccm` service – not exactly the same field, but conceptually an either/or usage. Intellisense could nudge users towards the recommended approach (for example, `selector` is manual, whereas `ccm` automates code-based switching).

- **Inter-field validations:** When a field references another (like tags), you might also validate that the reference exists. While writing, as mentioned, suggestions help avoid errors. After editing, a **“check”** (like running `sing-box check` command) can be surfaced to the user. For example, if a route rule refers to an outbound tag `"vpn2"` that doesn’t exist, the user should be alerted. This goes beyond static intellisense into dynamic validation, but it’s a crucial part of handling dependencies. (In absence of a live running check, the config schema still helps catch many issues – e.g. using a string where a number is expected, or a misspelled enum value.)

## Strategies for Implementing Intellisense / Autocomplete

Given the structured nature of sing-box’s config and the dependencies outlined, here are recommendations for achieving robust autocompletion:

- **Use a JSON Schema or Type Definitions:** The sing-box project can be described with a JSON Schema that includes all object structures, enum values, and conditional requirements. In fact, a community schema exists (and a TypeScript type library) that maps the entire config structure. Integrating such a schema with editors like VSCode provides immediate suggestions and validation. For example, the schema enumerates allowed values for fields like log level and route action, so the editor will autocomplete those. It also uses `oneOf` or `anyOf` constructs so that when `"type": "vmess"` is selected, the VMess-specific properties become valid. Adopting this schema (or generating one from the code) ensures your intellisense is always up-to-date with the latest version of sing-box.

- **Schema-driven Context:** A good schema can encode **if/then logic** for context. Sing-box’s schema can be modeled such that: “if an inbound’s `type` is X, then require fields A, B, C and allow no others” – this is typically done via conditional subschemas for each protocol. The official documentation segments each protocol’s fields (as we saw in the docs sections per inbound/outbound), which is a perfect guide for schema construction. By structuring the JSON schema with these conditions, an editor will automatically narrow completions to the valid fields in the given context. For instance, after you type `"type": "trojan"` and move to a new line within that object, the suggestions will be `"password"` or `"users"` (because the Trojan schema says those are valid) rather than irrelevant options.

- **Dynamic Suggestions from Document Content:** For reference fields like tags, a static schema can’t list actual tag names (since they are user-defined). Here, implementing a **JSON language server plugin or extension** can help. The idea is to **dynamically gather all defined tags** as the user edits, and then provide them as completion items when editing a field that expects a tag. For example, when the user is typing an `"outbound": ""` in a route rule, the extension can look at the JSON root, find all strings under `outbounds[].tag`, and offer them. This ensures consistency. Similarly, for DNS server tags or rule-set tags. If a tag is not yet defined (the user plans to define that outbound later), the extension might warn but still allow it – or could even offer to create a stub outbound with that tag. This dynamic approach requires some coding (beyond what a static schema offers), but it greatly enhances the config editing experience and reduces human error.

- **Snippets for Common Patterns:** Some config structures are repetitive or have common defaults. Intellisense can provide **snippets** – e.g., typing “vmess-outbound” could trigger a snippet that expands to the skeleton of a VMess outbound with placeholders for server, port, id, etc. Similarly, a snippet for a Shadowsocks server or a Trojan server with fallback could save time. These snippets can encode the typical dependencies (putting placeholders for required fields). For instance, a “shadowsocks-inbound” snippet would include the `"method": "${1|aes-128-gcm,chacha20-ietf-poly1305,2022-blake3-aes-128-gcm|}"` to let the user pick a cipher from a list, and a `${2:password}` placeholder. This leverages the known fixed value sets directly in the snippet. Combining snippets with schema validation covers both speed and accuracy.

- **Tooltips and Documentation Links:** Each field in the JSON schema can have a description (often taken from the documentation). Editors will show this as a tooltip. For example, hovering over `"fallback_for_alpn"` could show the text *“Fallback server configuration for specified ALPN. If not empty, TLS fallback requests with ALPN not in this table will be rejected.”* This is incredibly useful for understanding context dependencies without constantly referring to external docs. We should ensure the schema descriptions include notes on dependencies (the sing-box docs often mention when a field is required or what it depends on). The user in an editor would then see messages like *“Tag of the outbound to download rule-set. Default outbound will be used if empty.”* when filling in `download_detour`, reminding them of that behavior.

- **Validation & Linting:** Intellisense goes hand-in-hand with validation. By enforcing the structure (via schema) and cross-checking references (via extension), the configuration editor becomes much “smarter.” It can **prevent invalid combinations** – for example, if the user tries to put a `users` array under a Shadowsocks outbound (which doesn’t support multiple users in one config), the schema will flag it as invalid. Or if a required field is missing (say, no `"password"` in a Trojan inbound), the schema marks it as an error. Some editors will even underline missing required fields or unknown fields in red. This feedback in real time helps the user fix issues early.

- **Keep Schema Updated:** Sing-box is under active development (with versions 1.12, 1.13 alpha, etc.), introducing new protocols or fields (e.g. the *Hysteria2* protocol, *CCM service*, etc). It’s important to track these changes (the documentation change log highlights new fields per version). The intellisense rules should be updated accordingly – e.g. when Hysteria2 was added, a new `hysteria2` type with its own fields (perhaps different congestion control settings) should be added to the schema. If using the TypeScript type approach (like **@zhexin/typebox** library which aligns with sing-box versions), ensure you update to the matching version so that the editor suggestions stay accurate for the “latest version” config structure.

In conclusion, by leveraging a combination of **JSON Schema** (for structure and fixed values) and **dynamic context-aware logic** (for user-defined references and conditional hints), we can implement an Intellisense system that effectively **“completes”** the user’s input. It would guide the user through the nested config structure of sing-box, automatically suggest valid options at each step, fill in dependent fields, and alert about missing or incorrect configurations. This not only saves time but also helps users understand the relationships in the config (because the tool implicitly teaches what goes with what – e.g. you see immediately that choosing protocol X requires fields Y and Z, etc.).

Finally, here’s a **quick reference table of key fields and their dependencies** for clarity:

| **Key Field** | **Depends On / Influences** | **Value Completion** |
|----|----|----|
| `inbound.tag` / `outbound.tag` | Used as reference by route rules, selectors, etc. Must be unique. | Suggest existing tags wherever a reference is needed (e.g., in route rules). |
| `inbound.type` / `outbound.type` | Determines which fields are required next (protocol-specific). | Suggest valid protocol types (enums). After selection, auto-populate required subfields (e.g. method/password for shadowsocks). |
| `route.rules[].action` | If `"route"`, requires an outbound tag; if `"reject"`, allows method; etc. | Suggest actions (route, reject, etc). On choose, prompt needed fields (e.g., outbound). |
| `route.rules[].outbound` | Requires a tag of a defined outbound (only valid if action=route). | Suggest from defined outbound tags. Validate that the tag exists. |
| `route.final` | Should be set to an outbound tag (or left empty for default-first). | Suggest from outbound tags. Warn if tag is not found. |
| `dns.final` | Should match one of the `dns.servers[].tag` entries (or empty for first). | Suggest from DNS server tags. |
| `dns.rules[].action.server` | Must be a DNS server tag (for route action in DNS rules). | Suggest from DNS server tags. |
| `rule_set.download_detour` | If present, must be an outbound tag (for downloading remote rule files). | Suggest outbound tags. |
| `protocol-specific fields` | Appear only when parent type/protocol is set. E.g. `"password"` under trojan or shadowsocks, `"users"` under VMess inbound, `"fallback"` under trojan inbound, etc. | Auto-add or suggest these when applicable. Omit or flag them when in the wrong context. |
| `enum fields (general)` | Fixed set of values (e.g. log levels, DNS strategies, network types). | Provide drop-down of allowed constants (with descriptions). |

By following these guidelines, one can implement an Intellisense that leverages the *structure and dependencies* of the latest sing-box JSON schema to provide a smooth, error-resistant editing experience. The result is akin to having an expert looking over your shoulder as you write the config – prompting you with valid options and warning of inconsistencies – which is exactly what we want from a smart autocompletion system.
