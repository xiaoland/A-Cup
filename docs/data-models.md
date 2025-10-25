# Data Models

This document provides a high-level overview of the data models used in the application, focusing on their relationships and any constraints not explicitly defined in the OpenAPI specification. For detailed schema information, please refer to the `openapi/spec.json` file.

## Model Relationships

### User and Profile

*   A **User** can create multiple **Profiles**.
*   The `createdBy` field on a **Profile** establishes a one-to-many relationship, linking back to the `id` of the **User** who created it.

### Profile, Outbound, and RuleSet

*   A **Profile** is a container that groups together multiple **Outbounds** and **RuleSets**.
*   The `outbounds` and `rule_sets` fields on a **Profile** are arrays of `id`s, forming a many-to-many relationship between a **Profile** and both **Outbounds** and **RuleSets**.

### Access Control

*   Both the **Outbound** and **RuleSet** models include `readableBy` and `writeableBy` fields.
*   These fields contain arrays of **User** `id`s, allowing for granular control over which users can view or modify these resources.

## Additional Constraints and Information

### ID Generation

*   The `id` for **User** and **Profile** models are UUIDs.
*   The `id` for **Outbound** and **RuleSet** models are auto-incrementing sequences managed by the database.

### Outbound Credentials

*   The `credential` field within the **Outbound** model is a discriminated union. The structure of this object is determined by the value of the `type` field (e.g., `vless`, `vmess`, `shadowsocks`, `hysteria2`).

### RuleSet Content

*   The `content` of a **RuleSet** will vary based on its `type`.
    *   For `remote` **RuleSets**, the `content` will be a URL pointing to the rule set.
    *   For `inline` **RuleSets**, the `content` will be the rule set itself, formatted as a string.
