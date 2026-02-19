import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PaymentPage = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { Razorpay } = useRazorpay();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [amount, setAmount] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/projects/${projectId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setProject(response.data.project);
        const budgetSuggestion = getSuggestedAmount(response.data.project.budget);
        setAmount(budgetSuggestion);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoadingProject(false);
    }
  };

  const getSuggestedAmount = (budget) => {
    const budgetMap = {
      "Under ₹50,000": "25000",
      "₹50,000 - ₹1,00,000": "50000",
      "₹1,00,000 - ₹2,50,000": "150000",
      "₹2,50,000 - ₹5,00,000": "350000",
      "₹5,00,000+": "500000"
    };
    return budgetMap[budget] || "50000";
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await axios.post(
        `${BACKEND_URL}/api/payments/create-order`,
        {
          project_id: projectId,
          amount: parseFloat(amount)
        },
        { withCredentials: true }
      );

      if (orderResponse.data.razorpay_order_id) {
        // Real Razorpay payment
        const options = {
          key: orderResponse.data.razorpay_key_id,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: 'Purple Aster Studio',
          description: `Payment for ${project.services.join(', ')}`,
          order_id: orderResponse.data.razorpay_order_id,
          handler: async function (response) {
            try {
              // Verify payment on backend
              const verifyResponse = await axios.post(
                `${BACKEND_URL}/api/payments/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  payment_id: orderResponse.data.payment_id
                },
                { withCredentials: true }
              );

              if (verifyResponse.data.success) {
                setPaymentSuccess(true);
                toast.success('Payment successful!');
                setTimeout(() => {
                  navigate('/dashboard');
                }, 2000);
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: project?.client_phone || ''
          },
          theme: {
            color: '#7C3AED'
          }
        };

        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();
        
        razorpayInstance.on('payment.failed', function (response) {
          toast.error('Payment failed. Please try again.');
          console.error('Payment failed:', response.error);
        });
        
      } else {
        // Mock payment (Razorpay not configured)
        setPaymentSuccess(true);
        toast.success('Payment processed successfully! (MOCKED)');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProject) {
    return (
      <div className="payment-loading">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="payment-error">
        <h2>Project not found</h2>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="payment-success-page">
        <div className="payment-success-container">
          <div className="payment-success-content">
            <div className="payment-success-icon">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </div>
            <h1 className="payment-success-title">Payment Successful!</h1>
            <p className="payment-success-text">
              Your payment has been processed successfully. You'll be redirected to your dashboard shortly.
            </p>
            <div className="payment-success-details">
              <p><strong>Project:</strong> {project.services.join(', ')}</p>
              <p><strong>Amount Paid:</strong> ₹{parseFloat(amount).toLocaleString('en-IN')}</p>
              <p><strong>Status:</strong> Processing</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <h1 className="payment-title">Payment</h1>
          <p className="payment-subtitle">
            Secure your project with a payment
          </p>
        </div>

        <div className="payment-grid">
          {/* Project Summary */}
          <Card className="project-summary-card">
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="summary-item">
                <span className="summary-label">Services:</span>
                <span className="summary-value">{project.services.join(', ')}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Goal:</span>
                <span className="summary-value">{project.goal}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Platform:</span>
                <span className="summary-value">{project.platform}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Timeline:</span>
                <span className="summary-value">{project.timeline}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Budget Range:</span>
                <span className="summary-value">{project.budget}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="payment-form-card">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="payment-form">
                <div className="form-field">
                  <Label htmlFor="amount">Payment Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                  />
                  <p className="form-hint">
                    Suggested based on your budget range
                  </p>
                </div>

                <div className="payment-method">
                  <Label>Payment Method</Label>
                  <div className="payment-method-option selected">
                    <CreditCard className="h-5 w-5" />
                    <span>PayPal (MOCKED)</span>
                  </div>
                  <p className="payment-note">
                    Note: This is a mock payment for testing. No actual transaction will occur.
                    Real PayPal integration will be added soon.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full cta-primary payment-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Process Payment (MOCK)
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => navigate('/dashboard')}
                >
                  Skip for Now
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
