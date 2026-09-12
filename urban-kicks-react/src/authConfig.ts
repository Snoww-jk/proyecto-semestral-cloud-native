import type { AuthProviderProps } from "react-oidc-context";

const clientId = "7g1pk0kvuigi2ftb3bq3f18u5n";
const logoutUri = "http://localhost:5173";

export const cognitoAuthConfig: AuthProviderProps = {
  authority:
    "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_VuVX3Pv5a",

  client_id: clientId,

  redirect_uri: "http://localhost:5173",

  response_type: "code",

  scope: "email openid",

  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname,
    );
  },
};

export const cognitoLogoutUrl =
  "https://us-east-1vuvx3pv5a.auth.us-east-1.amazoncognito.com/logout" +
  `?client_id=${clientId}` +
  `&logout_uri=${encodeURIComponent(logoutUri)}`;