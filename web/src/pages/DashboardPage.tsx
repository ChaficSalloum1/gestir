import { Link } from 'react-router-dom';
import { Upload, Sparkles, Palette, User } from 'lucide-react';

export function DashboardPage() {
  const features = [
    {
      title: 'Upload & Detect',
      description: 'Upload photos and let AI detect people in your images',
      icon: Upload,
      href: '/upload',
      color: 'bg-blue-500',
    },
    {
      title: 'One Spark',
      description: 'Get AI-powered outfit suggestions from your wardrobe',
      icon: Sparkles,
      href: '/spark',
      color: 'bg-purple-500',
    },
    {
      title: 'Color Goals',
      description: 'Create cohesive capsule wardrobes with style tiles',
      icon: Palette,
      href: '/palette',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Gestir V2</h1>
        <p className="text-lg text-gray-600">
          Your AI-powered fashion assistant is ready to help you look your best
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.href}
            className="group block"
          >
            <div className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-gray-100">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
            <p className="text-gray-600">
              Start by uploading a photo of yourself to build your digital wardrobe, then explore outfit suggestions and color capsules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




