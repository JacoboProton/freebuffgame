'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Award, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Certificate {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: string;
  course: {
    title: string;
    category: string;
    imageUrl?: string;
  };
  user: {
    name: string;
    avatar?: string;
  };
}

interface CertificateDownloadProps {
  courseId: string;
  courseTitle: string;
  isCompleted: boolean;
}

export function CertificateDownload({ courseId, courseTitle, isCompleted }: CertificateDownloadProps) {
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCertificate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/certificates/generate/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.status === 'success') {
        setCertificate(data.data.certificate);
      } else {
        setError(data.message || 'Failed to generate certificate');
      }
    } catch (err) {
      setError('Failed to generate certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificate) return;

    // For now, open verification page in new tab
    window.open(`/verify/${certificate.verificationCode}`, '_blank');
  };

  const handleCopyVerificationLink = () => {
    if (!certificate) return;
    
    const link = `${window.location.origin}/verify/${certificate.verificationCode}`;
    navigator.clipboard.writeText(link);
    alert('Verification link copied to clipboard!');
  };

  if (!isCompleted) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6 text-center">
          <Award className="w-12 h-12 mx-auto text-amber-400 mb-3" />
          <h3 className="font-bold text-lg mb-2">Certificate Available</h3>
          <p className="text-gray-600 text-sm mb-4">
            Complete all lessons in this course to earn your certificate.
          </p>
          <Badge className="text-amber-600 border-amber-300 bg-transparent">
            Complete course to unlock
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent-mint/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Award className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Course Certificate</h3>
            <p className="text-gray-600 text-sm mb-3">
              You've completed "{courseTitle}". Download your official certificate!
            </p>

            {certificate ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Certificate generated</span>
                </div>

                <div className="bg-white/80 rounded-lg p-3 text-xs font-mono text-gray-600">
                  Certificate #: {certificate.certificateNumber}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadPDF}
                    className="flex-1 gap-2"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>

                  <Button
                    onClick={handleCopyVerificationLink}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                onClick={handleGenerateCertificate}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Generate Certificate
                  </>
                )}
              </Button>
            )}

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component to display user's certificate list
export function CertificateList({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="font-semibold text-lg mb-2">No certificates yet</h3>
        <p className="text-gray-500">Complete courses to earn certificates!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {certificates.map((cert) => (
        <motion.div
          key={cert.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm line-clamp-1">{cert.course.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(cert.issuedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-gray-400 mb-3">
                {cert.certificateNumber}
              </div>

              <Button
                onClick={() => window.open(`/verify/${cert.verificationCode}`, '_blank')}
                variant="ghost"
                size="sm"
                className="w-full gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                View & Share
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}