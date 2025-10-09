import { OUTBOUNDS_ROUTER } from "./apis/outbound";
import { USERS_ROUTER } from "./apis/user";
import { RULE_SET_ROUTER } from "./apis/rule-set";
import { PROFILE_ROUTER } from "./apis/profile";
import { api_router } from "./fund/router";

api_router.merge(OUTBOUNDS_ROUTER);
api_router.merge(USERS_ROUTER);
api_router.merge(RULE_SET_ROUTER);
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
