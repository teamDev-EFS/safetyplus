import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Mail, Phone, MapPin, Building2, Clock } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useQuery } from "@tanstack/react-query";
import { contactAPI, settingsAPI, branchesAPI } from "../lib/api";

export function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    mobile: "",
    email: "",
    subject: "",
    message: "",
    consent: false,
  });
  const [loading, setLoading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsAPI.get(),
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesAPI.getAll(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consent) {
      toast({
        title: "Privacy Policy Required",
        description: "Please accept the privacy policy",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await contactAPI.submit({
        name: formData.name,
        company: formData.company,
        mobile: formData.mobile,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      toast({
        title: "Success",
        description: "Message sent successfully! We will contact you soon.",
      });
      setFormData({
        name: "",
        company: "",
        mobile: "",
        email: "",
        subject: "",
        message: "",
        consent: false,
      });
    } catch (error) {
      console.error("Contact form error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm mb-4 opacity-90">
            Home › <span className="font-semibold">Contact Us</span>
          </nav>
          <h1 className="text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl opacity-90">
            We're here to help. Reach out to us for any inquiries or support.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Head Office
            </h2>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Address</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    New Siyaganj, Unit No. AS-22,
                    <br />
                    HTL Unit No.2 Block No. A-4,
                    <br />
                    Mal Godown Road,
                    <br />
                    Indore 452 007 (M.P.) India
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Phone Numbers</h3>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      0731-2430082-83
                    </p>
                    <p>
                      <span className="font-medium">Mobile:</span> 94248-36079
                    </p>
                    <p>
                      <span className="font-medium">Fax:</span> 0731-2430084
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Email Addresses
                  </h3>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Marketing:</span>{" "}
                      marketing@safetyplus.co.in
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 1:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Send Us a Message
            </h2>

            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-md space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10,15}"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consent}
                    onChange={(e) =>
                      setFormData({ ...formData, consent: e.target.checked })
                    }
                    className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the privacy policy and consent to SafetyPlus
                    storing and processing my data for the purpose of responding
                    to my inquiry.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>

        {branches && branches.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Our Branches
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  {branch.image_path && (
                    <img
                      src={branch.image_path}
                      alt={branch.city}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-green-600" />
                      {branch.city}
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium mb-1">Address:</p>
                        {branch.address_lines.map((line, idx) => (
                          <p
                            key={idx}
                            className="text-gray-600 dark:text-gray-400"
                          >
                            {line}
                          </p>
                        ))}
                      </div>

                      {branch.phones && branch.phones.length > 0 && (
                        <div>
                          <p className="font-medium mb-1">Phone:</p>
                          {branch.phones.map((phone, idx) => (
                            <p
                              key={idx}
                              className="text-gray-600 dark:text-gray-400"
                            >
                              {phone}
                            </p>
                          ))}
                        </div>
                      )}

                      {branch.emails && branch.emails.length > 0 && (
                        <div>
                          <p className="font-medium mb-1">Email:</p>
                          {branch.emails.map((email, idx) => (
                            <p
                              key={idx}
                              className="text-gray-600 dark:text-gray-400"
                            >
                              {email}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {branch.map_embed_url && (
                      <div className="mt-4">
                        <iframe
                          src={branch.map_embed_url}
                          width="100%"
                          height="200"
                          frameBorder="0"
                          className="rounded-lg"
                          title={`Map of ${branch.city}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
