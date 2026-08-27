import React from 'react'
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react";


import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loginUser } from "@/lib/features/loginSlice";
import { setAuthSession } from "@/lib/features/auth-slice";

const LoginForm = () => {
     const router = useRouter();
  const dispatch = useDispatch();
  const loginLoading = useSelector((state) => state.login?.loading);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await dispatch(
        loginUser({ username, password }),
      ).unwrap();

      dispatch(
        setAuthSession({
          role: result.role,
          account_type: result.account_type,
          username: result.username,
          user: {
            ...result.user,
            role: result.role,
            account_type: result.account_type,
            username: result.username,
            label: result.label,
          },
          token: result.token,
          token_type: result.token_type,
          expires_in: result.expires_in,
          loginAt: result.loginAt,
        }),
      );

      setSuccessMessage(`Welcome ${result.label}. Redirecting...`);

      // Honor ?next=<path> set by the auth middleware so users land on the
      // page they originally requested. Only allow internal paths ("/...")
      // (and reject "//..." protocol-relative URLs) to prevent open redirects.
      const nextParam = new URLSearchParams(window.location.search).get("next");
      const safeNext =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : null;

      window.setTimeout(() => {
        router.push(safeNext || result.redirectTo);
      }, 500);
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message || "Unable to login.";
      setErrorMessage(message);
    }
  };
  return (
   <>
   <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_45%),radial-gradient(circle_at_bottom_right,hsl(var(--secondary)/0.18),transparent_40%)]" />

      <Card className="relative z-10 w-full max-w-max border border-brand-blue shadow-2xs sm:max-w-max md:max-w-1/2 lg:max-w-1/4">
        <CardHeader className="space-y-1">
          <div className="flex flex-row items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Svastha Logo"
              width={50}
              height={50}
              className=""
            />
            <span className="truncate font-sf text-2xl font-semibold text-brand-blue transition-all tracking-wide duration-200">
              Svas<span className="text-brand-green">t</span>ha
            </span>
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in with your username and password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {successMessage}
              </p>
            ) : null}

            <Button className="w-full" type="submit" disabled={loginLoading}>
              Sign In
            </Button>

            {/* <div className="rounded-md border border-border/70 bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Demo credentials</p>
              
            </div> */}
          </form>
        </CardContent>
      </Card>
      </>
  )
}

export default LoginForm