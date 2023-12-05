import { Router } from "@angular/router";
import { getBaseURL } from "./fetch-server";

// redirects to discord login page
export async function loginWithDiscord(router: Router) {

    let redirect = router.url.slice(1); // Remove the leading '/'

    const baseURL = getBaseURL();
    const url = `${baseURL}/api/auth?redirect=${redirect}`;
    window.location.href = url;
  }