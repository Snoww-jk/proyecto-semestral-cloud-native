import type { AuthProviderProps } from "react-oidc-context";

export const cognitoAuthConfig: AuthProviderProps = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_VuVX3Pv5a",
  client_id: "7g1pk0kvuigi2ftb3bq3f18u5n",
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
