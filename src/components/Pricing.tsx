'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small cafes and restaurants',
      monthlyPrice: 19,
      annualPrice: 190,
      features: [
        'Up to 3 menus',
        'Unlimited menu items',
        'Basic templates',
        'QR code generation',
        'Basic analytics',
        'Email support'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      description: 'Great for growing restaurants',
      monthlyPrice: 39,
      annualPrice: 390,
      features: [
        'Unlimited menus',
        'Unlimited menu items',
        'Premium templates',
        'Custom branding',
        'Advanced analytics',
        'Photo uploads',
        'Priority support',
        'Multi-location support'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      description: 'For restaurant chains and franchises',
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        'Everything in Professional',
        'White-label solution',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced security',
        'Custom analytics',
        'SLA guarantee'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Choose the plan that's right for your business. All plans include a 7-day free trial.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 bg-gray-100 rounded-lg p-1 max-w-xs mx-auto">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !isAnnual
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                  isAnnual
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIsAnnual(true)}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl border-2 p-8 ${
                  plan.popular
                    ? 'border-primary-500 shadow-xl scale-105'
                    : 'border-gray-200 shadow-sm hover:shadow-lg'
                } transition-all duration-300`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-gray-500">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-green-600 mt-2">
                        Save ${(plan.monthlyPrice * 12) - plan.annualPrice} per year
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={plan.cta === 'Contact Sales' ? '/contact' : '/register'}
                    className={`block w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                      plan.popular
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 pt-16 border-t border-gray-200">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Can I change plans anytime?
                </h4>
                <p className="text-gray-600">
                  Yes! You can upgrade, downgrade, or cancel your subscription at any time. 
                  Changes take effect at your next billing cycle.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  What happens to my QR codes if I cancel?
                </h4>
                <p className="text-gray-600">
                  Your QR codes will show a "menu temporarily unavailable" message. 
                  Your data is preserved for 30 days in case you decide to reactivate.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Do you offer refunds?
                </h4>
                <p className="text-gray-600">
                  We offer a 7-day free trial, so you can test everything before paying. 
                  For annual plans, we offer a 30-day money-back guarantee.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Is there a setup fee?
                </h4>
                <p className="text-gray-600">
                  No setup fees, no hidden costs. You only pay the monthly or annual 
                  subscription fee. Everything you need is included.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 lg:p-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to transform your restaurant?
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Start your 7-day free trial today. No credit card required. 
                Cancel anytime.
              </p>
              <Link
                href="/register"
                className="btn-primary text-lg px-8 py-4 inline-block"
              >
                Start Your Free Trial
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                No credit card required • 7-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing
