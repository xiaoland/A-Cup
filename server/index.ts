import { OUTBOUNDS_ROUTER } from "./apis/outbound";
import { INBOUND_ROUTER } from "./apis/inbound";
import { USERS_ROUTER } from "./apis/user";
import { ROUTE_RULE_ROUTER } from "./apis/route-rule";
import { RULE_SET_ROUTER } from "./apis/rule-set";
import { DNS_SERVER_ROUTER } from "./apis/dns-server";
import { DNS_RULE_ROUTER } from "./apis/dns-rule";
import { ENDPOINT_ROUTER } from "./apis/endpoint";
import { PROFILE_ROUTER } from "./apis/profile";
import { api_router } from "./fund/router";

api_router.merge(OUTBOUNDS_ROUTER);
api_router.merge(INBOUND_ROUTER);
api_router.merge(USERS_ROUTER);
api_router.merge(ROUTE_RULE_ROUTER);
api_router.merge(RULE_SET_ROUTER);
api_router.merge(DNS_SERVER_ROUTER);
api_router.merge(DNS_RULE_ROUTER);
api_router.merge(ENDPOINT_ROUTER);
api_router.merge(PROFILE_ROUTER);

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname.startsWith("/api/")) {
			return await api_router.handle(request, env);
		}
		return new Response(null, { status: 404 });
	},
} satisfies ExportedHandler<Env>;
