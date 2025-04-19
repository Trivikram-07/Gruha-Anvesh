import React from 'react';
import { Github, Linkedin, Mail, Phone, Code2 } from 'lucide-react';
import ProfileImage from './me.jpg'; // Import the image file from the same directory

function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-12">
            <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-full rotating-bg opacity-75 blur-xl group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-2 bg-gray-900 rounded-full"></div>
              <div className="relative w-full h-full circular-wave overflow-hidden bg-emerald-400/10 backdrop-blur-sm">
                <img 
                  src={ProfileImage} // Use the imported image
                  alt="Developer Profile"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Trivikram</h1>
            <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
              <Code2 className="w-5 h-5" />
              <span className="text-xl">Full Stack Developer</span>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Passionate full stack developer with expertise in modern web technologies.
              Dedicated to creating elegant solutions and delivering exceptional user experiences.
              Always eager to take on new challenges and learn cutting-edge technologies.
            </p>
          </div>

          {/* Contact Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <a href="tel:+1234567890" className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors">
                  <Phone className="w-5 h-5" />
                  <span>+91 9876543210</span>
                </a>
                <a href="mailto:sudhkarreddyvikram@gmail.com" className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors">
                  <Mail className="w-5 h-5" />
                  <span>sudhkarreddyvikram@gmail.com</span>
                </a>
                <a href="https://www.linkedin.com/in/dhanireddy-trivikram-reddy-35b342246/" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                  <span>linkedin.com/in/Dhanireddy Trivikram Reddy
                  </span>
                </a>
                <a href="https://github.com/Trivikram-07" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors">
                  <Github className="w-5 h-5" />
                  <span>github.com/Trivikram-07</span>
                </a>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-6">Technical Skills</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-emerald-400">Frontend</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>React.js</li>
                    <li>TypeScript</li>
                    <li>JavaScript</li>
                    <li>Tailwind CSS</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-emerald-400">Backend</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>Node.js</li>
                    <li>MongoDB</li>
                    <li>Express</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
