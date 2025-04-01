import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home as HomeIcon, Users as UsersIcon, CreditCard as CreditCardIcon, Check as CheckIcon, X as XIcon, RotateCw } from 'lucide-react';

// Icons
export const House = HomeIcon;
export const RotateView = (props: React.SVGProps<SVGSVGElement>) => <RotateCw {...props} />;
export const Users = UsersIcon;
export const CreditCard = CreditCardIcon;
export const Check = CheckIcon;
export const X = XIcon;

// AnimatedBackground Component
const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      <div className="absolute -bottom-8 right-20 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '6s' }}></div>
    </div>
  );
};

// PlanFeature Component
interface PlanFeatureProps {
  included: boolean;
  feature: string;
  highlight?: boolean;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ 
  included, 
  feature,
  highlight = false
}) => {
  return (
    <div className={`flex items-center py-2 space-x-3 animate-fade-in ${highlight ? 'font-medium' : ''}`}>
      {included ? (
        <Check className="h-5 w-5 flex-shrink-0 text-blue-500" />
      ) : (
        <X className="h-5 w-5 flex-shrink-0 text-gray-400" />
      )}
      <span className={`text-sm ${!included ? 'text-gray-500' : ''} ${highlight ? 'text-blue-500' : ''}`}>
        {feature}
      </span>
    </div>
  );
};

// PlanCard Component
interface PlanCardProps {
  name: string;
  price: string;
  description: string;
  features: Array<{ name: string; included: boolean; highlight?: boolean }>;
  popular?: boolean;
  icon: 'house' | 'premium';
  className?: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  description,
  features,
  popular = false,
  icon,
  className,
}) => {
  return (
    <div className={`w-full max-w-md border rounded-lg shadow-md hover:shadow-lg transition-all duration-500 animate-fade-up ${popular ? 'scale-105 z-10 border-blue-500/50' : 'border-gray-200'} ${className}`}>
      <div className="p-6 space-y-1">
        {popular && (
          <span className="inline-block mb-2 bg-blue-100 border border-blue-200 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
            Recommended
          </span>
        )}
        
        <div className="flex items-center gap-2">
          {icon === 'house' && <House className="h-5 w-5 text-gray-500" />}
          {icon === 'premium' && <Users className="h-5 w-5 text-blue-500" />}
          <h3 className={`text-2xl font-medium tracking-tight ${popular ? 'text-blue-500' : ''}`}>
            {name}
          </h3>
        </div>
        
        <p className="text-gray-500">{description}</p>
        
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Free' && <span className="text-gray-500 ml-1">/month</span>}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 px-6">
        <div className="space-y-2">
          {features.map((feature, index) => (
            <PlanFeature 
              key={index} 
              feature={feature.name} 
              included={feature.included} 
              highlight={feature.highlight}
            />
          ))}
        </div>
      </div>
      
      <div className="p-6 pt-4">
        <button className={`w-full rounded-md py-2 transition-all flex items-center justify-center ${popular ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
          <CreditCard className="h-4 w-4 mr-2" />
          Get {name}
        </button>
      </div>
    </div>
  );
};

// Subscription Component
const Subscription: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  const scaleVariants = {
    hidden: { scale: 0.98, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { 
        delay: custom * 0.1 + 0.3,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 overflow-hidden relative">
      <AnimatedBackground />
      
      <div className="container max-w-6xl mx-auto z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            custom={0}
            variants={fadeInUpVariants}
            className="inline-block bg-blue-100 text-blue-500 px-3 py-1 rounded-full text-sm font-medium mb-4"
          >
            Choose Your Plan
          </motion.div>
          
          <motion.h1 
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            custom={1}
            variants={fadeInUpVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
          >
            Find the Perfect Plan for Your 
            <span className="text-blue-500"> Property</span>
          </motion.h1>
          
          <motion.p 
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            custom={2}
            variants={fadeInUpVariants}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Select the plan that fits your needs. From basic property listings to premium features with dedicated support.
          </motion.p>
        </div>
        
        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            custom={3}
            variants={scaleVariants}
          >
            <PlanCard
              name="Free"
              price="Free"
              description="Basic features for property listings"
              icon="house"
              features={[
                { name: "Post unlimited properties", included: true, highlight: true },
                { name: "Basic property analytics", included: true },
                { name: "Standard listing visibility", included: true },
                { name: "3D tours (charged per tour)", included: true },
                { name: "Team assignment", included: false },
                { name: "Priority customer support", included: false },
                { name: "Advanced analytics", included: false },
              ]}
            />
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            custom={4}
            variants={scaleVariants}
          >
            <PlanCard
              name="Pro"
              price="$29.99"
              description="Premium features with dedicated support"
              icon="premium"
              popular={true}
              features={[
                { name: "Post unlimited properties", included: true },
                { name: "Advanced property analytics", included: true },
                { name: "Enhanced listing visibility", included: true },
                { name: "Free unlimited 3D tours", included: true },
                { name: "Team assignment (3 free/year)", included: true, highlight: true },
                { name: "Priority customer support", included: true },
                { name: "Custom branding options", included: true },
              ]}
            />
          </motion.div>
        </div>
        
        {/* Features breakdown */}
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          custom={5}
          variants={fadeInUpVariants}
          className="mt-20 text-center"
        >
          <h2 className="text-2xl font-bold mb-8">Why Choose Our Pro Plan?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-lg">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <House className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-medium text-lg mb-2">Property Listings</h3>
              <p className="text-gray-500 text-sm">Post unlimited properties with enhanced visibility and advanced analytics.</p>
            </div>
            
            <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-lg">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateView className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-medium text-lg mb-2">3D Tours</h3>
              <p className="text-gray-500 text-sm">Create unlimited 3D tours with our Pro plan, compared to pay-per-use in Free plan.</p>
            </div>
            
            <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-lg">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-medium text-lg mb-2">Team Assignment</h3>
              <p className="text-gray-500 text-sm">Get 3 free team assignments per year, with additional assignments priced by property size.</p>
            </div>
          </div>
        </motion.div>
        
        {/* FAQ section */}
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          custom={6}
          variants={fadeInUpVariants}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white shadow-md p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">How much do 3D tours cost in the Free plan?</h3>
              <p className="text-gray-500">3D tours are priced at $49 per property in the Free plan. Pro plan members get unlimited 3D tours at no additional cost.</p>
            </div>
            
            <div className="bg-white shadow-md p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">What does team assignment include?</h3>
              <p className="text-gray-500">Team assignment provides a dedicated real estate professional to help market and sell your property. Pro plan includes 3 free assignments per year.</p>
            </div>
            
            <div className="bg-white shadow-md p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">How much do additional team assignments cost?</h3>
              <p className="text-gray-500">Additional team assignments are priced based on property size:<br />
                - Small properties: $99<br />
                - Medium properties: $149<br />
                - Large properties: $199</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;