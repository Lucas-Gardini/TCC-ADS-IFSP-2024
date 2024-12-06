// export default defineNuxtPlugin((nuxtApp) => {
// 	nuxtApp.provide("event", {
// 		emit: (eventName: string, ...args: any[]) => {
// 			nuxtApp.callHook(eventName as any, ...args);
// 		},
// 		on: (eventName: string, callback: Function) => {
// 			nuxtApp.hook(eventName as any, callback);
// 		},
// 	});
// });

export default defineNuxtPlugin({
	name: "event",
	enforce: "pre",

	async setup(_) {
		return {
			provide: {
				event: {
					emit: (eventName: string, ...args: any[]) => {
						_.callHook(eventName as any, ...args);
					},
					on: (eventName: string, callback: Function) => {
						_.hook(eventName as any, callback);
					},
				},
			},
		};
	},

	env: {
		islands: false,
	},
});
