import { cardApi } from "../server/card-api.js";

export default {
  fetch(request) {
    const url = new URL(request.url);
    url.pathname = "/api/health";
    return cardApi(new Request(url, { method: request.method }), () => {
      throw new Error("Health checks do not load assets");
    });
  },
};
