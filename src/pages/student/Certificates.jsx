import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Award, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCertificatesForStudent } from '../../firebase/firestore';

const VERIFY_BASE = typeof window !== 'undefined' ? window.location.origin : 'https://gyannext.example.com';

function formatDate(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function downloadCertificatePdf(cert) {
  const verifyUrl = `${VERIFY_BASE}/verify/${cert.certId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 });

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFillColor(108, 99, 255);
  doc.rect(0, 0, w, h, 'F');
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(30, 30, w - 60, h - 60, 12, 12, 'F');

  doc.setTextColor(108, 99, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('GyanNext', w / 2, 100, { align: 'center' });

  doc.setTextColor(20, 19, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Certificate of Completion', w / 2, 130, { align: 'center' });

  doc.setFontSize(12);
  doc.text('This certifies that', w / 2, 175, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(cert.studentName || 'Student', w / 2, 210, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('has successfully completed the course', w / 2, 240, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(cert.courseTitle || 'Course', w / 2, 268, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 110);
  doc.text(`Issued on ${formatDate(cert.issuedAt)}  ·  Certificate ID: ${cert.certId}`, w / 2, 300, { align: 'center' });

  doc.addImage(qrDataUrl, 'PNG', w - 150, h - 150, 90, 90);
  doc.setFontSize(8);
  doc.text('Scan to verify', w - 105, h - 52, { align: 'center' });

  doc.save(`GyanNext-Certificate-${cert.certId}.pdf`);
}

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCertificatesForStudent(user.uid);
        setCertificates(data);
      } catch {
        setError('Could not load certificates right now.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleDownload = async (cert) => {
    setDownloading(cert.id);
    try {
      await downloadCertificatePdf(cert);
    } catch {
      setError('Could not generate the PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Certificates</h1>
      <p className="mt-1 text-sm text-ink-400">Real certificates issued by your teachers — each one is downloadable and QR-verifiable.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading certificates...</div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : certificates.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">
          No certificates yet — your teacher issues one once you've completed a course.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div key={cert.id} className="overflow-hidden rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
              <div className="relative bg-brand-gradient p-6 text-white">
                <Award size={28} className="opacity-90" />
                <p className="mt-3 font-display text-lg font-bold">{cert.courseTitle}</p>
                <p className="text-xs text-white/80">Certificate of Completion</p>
              </div>
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-xs text-ink-400">Awarded to</p>
                  <p className="font-display font-semibold text-ink-900 dark:text-white">{cert.studentName}</p>
                  <p className="mt-2 text-xs text-ink-400">Issued {formatDate(cert.issuedAt)}</p>
                  <p className="text-xs text-ink-400">ID: {cert.certId}</p>
                </div>
                <div className="rounded-lg bg-white p-2">
                  <QRCodeSVG value={`${VERIFY_BASE}/verify/${cert.certId}`} size={64} />
                </div>
              </div>
              <button
                onClick={() => handleDownload(cert)}
                disabled={downloading === cert.id}
                className="btn-outline m-5 mt-0 w-[calc(100%-2.5rem)] !py-2 text-xs disabled:opacity-60"
              >
                {downloading === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
