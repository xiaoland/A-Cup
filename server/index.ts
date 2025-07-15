import { api_router } from "./fund/router";

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname.startsWith("/api/")) {
			return await api_router.handle(request, env);
		}
		return new Response(null, { status: 404 });
	},
} satisfies ExportedHandler<Env>;
