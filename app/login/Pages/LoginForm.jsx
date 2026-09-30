import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, LogIn, ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/lib/features/loginSlice";
import { setAuthSession } from "@/lib/features/auth-slice";
import { scheduleProactiveRefresh } from "@/lib/auth-utils";
import { TextField } from "@/components/ui/text-field";
import ForgotPasswordFlow from "../components/ForgotPasswordFlow";

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const loginLoading = useSelector((state) => state.login?.loading);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  // Swaps the sign-in card for the 3-step recovery wizard.
  const [isResetting, setIsResetting] = React.useState(false);

  const showForgotPassword = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsResetting(true);
  };

  const cancelForgotPassword = () => {
    setErrorMessage("");
    setIsResetting(false);
  };

  const handleReset = () => {
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await dispatch(loginUser({ username, password })).unwrap();

      dispatch(
        setAuthSession({
          role: result.role,
          account_type: result.account_type,
          primary_doctor: result.primary_doctor,
          username: result.username,
          user: {
            ...result.user,
            role: result.role,
            account_type: result.account_type,
            username: result.username,
            label: result.label,
          },
          token: result.token,
          refresh_token: result.refresh_token,
          token_type: result.token_type,
          expires_in: result.expires_in,
          loginAt: result.loginAt,
          account: result.account ?? {},
        }),
      );

      scheduleProactiveRefresh(60, dispatch);

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
      <Card className="relative z-10 w-full max-w-2/3 border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-4">
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-brand-blue shadow-lg shadow-primary/25"
              initial={{ scale: 0.8, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/logo.svg"
                alt="Svastha Logo"
                width={24}
                height={24}
                className="brightness-0 invert"
              />
            </motion.span>
            <div className="flex min-w-0 flex-col">
              <span className="login-wordmark text-2xl">
                Svas<em>t</em>ha
              </span>
              <small className="login-tagline py-1">
                Healthy Roots <span className="text-brand-green">Rising Stars</span>
              </small>
            </div>
          </motion.div>

          <motion.div
            className="space-y-1.5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <CardTitle className="font-sf text-3xl font-semibold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Sign in to access your account and manage student health records.
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent>
          {/* Recovery wizard replaces the sign-in form in place, so the logo
              and layout stay put instead of jumping to a new page. */}
          {isResetting ? (
            <ForgotPasswordFlow onCancel={cancelForgotPassword} />
          ) : (
          <motion.form
            className="space-y-4"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-2">
              <TextField
                label="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                inputClassName="h-11 rounded-xl bg-background/70 transition-colors focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium leading-none text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="h-11 rounded-xl bg-background/70 pr-11 transition-colors focus-visible:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                role="alert"
              >
                {errorMessage}
              </motion.p>
            ) : null}

            {successMessage ? (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success"
                role="status"
              >
                {successMessage}
              </motion.p>
            ) : null}

            {/* Opens the recovery wizard. Placed between Password and Reset so
                it reads as part of the password field. */}
            {/* <button
              type="button"
              onClick={showForgotPassword}
              className="flex w-full items-center justify-end gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <KeyRound className="size-3.5" aria-hidden="true" />
              Forgot password?
            </button> */}

            <div className="flex w-full flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="h-11 w-2/5 rounded-xl bg-background/60"
                type="reset"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                className="h-11 w-3/5 gap-2 rounded-xl bg-gradient-to-r from-primary to-brand-blue shadow-lg shadow-primary/25 transition-transform hover:brightness-105 active:scale-[0.98]"
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" aria-hidden="true" />
                    Sign In
                    <ArrowRight
                      className="size-4 transition-transform group-hover/button:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </>
                )}
              </Button>
            </div>

            <p className="login-note pt-1">
              <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="login-note__title">Secure sign-in.</span> Your session
                is protected and activity is logged.
              </span>
            </p>
          </motion.form>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default LoginForm;
