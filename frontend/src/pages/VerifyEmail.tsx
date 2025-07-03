import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const resendEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResendEmailFormData = z.infer<typeof resendEmailSchema>;

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendEmailFormData>({
    resolver: zodResolver(resendEmailSchema),
    defaultValues: {
      email: email || "",
    },
  });

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/verify-email`, {
          params: { token, email },
        });

        if (res.status === 200) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now sign in to your account.');
        } else {
          setStatus('error');
          setMessage(res.data?.error || 'Verification failed. Please try again.');
        }
      } catch (err: any) {
        const msg = err?.response?.data?.error;
        if (msg?.toLowerCase().includes("expired")) {
          setStatus('expired');
          setMessage('This verification link has expired. Please request a new one.');
        } else {
          setStatus('error');
          setMessage(msg || 'Invalid or expired verification token.');
        }
      }
    };

    verifyEmail();
  }, [token, email]);

  const onResendSubmit = async (data: ResendEmailFormData) => {
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, data);
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      });
      setShowResendForm(false);
    } catch (error: any) {
      toast({
        title: "Failed to send",
        description: error?.response?.data?.error || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Mail className="h-16 w-16 text-gray-400" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying your email...';
      case 'success':
        return 'Email verified successfully!';
      case 'error':
        return 'Verification failed';
      case 'expired':
        return 'Link expired';
      default:
        return 'Email verification';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <CardTitle className="text-2xl font-bold text-gray-900">{getStatusTitle()}</CardTitle>
            {email && <CardDescription className="text-base">{email}</CardDescription>}
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className={`$ {
              status === 'success' ? 'border-green-200 bg-green-50' :
              status === 'error' || status === 'expired' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <AlertDescription className={`$ {
                status === 'success' ? 'text-green-800' :
                status === 'error' || status === 'expired' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {status === 'success' && (
                <Button onClick={handleBackToLogin} className="w-full">
                  Continue to Sign In
                </Button>
              )}

              {(status === 'error' || status === 'expired') && (
                <>
                  {!showResendForm ? (
                    <Button onClick={() => setShowResendForm(true)} className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Resend verification email
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmit(onResendSubmit)} className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          {...register("email")}
                          className="h-11"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                          {isSubmitting ? "Sending..." : "Send"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowResendForm(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  <Button onClick={handleBackToLogin} variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </>
              )}

              {status === 'loading' && (
                <Button onClick={handleBackToLogin} variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Having trouble? Contact support at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
