import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ReturnsPolicy = () => (
  <div className="min-h-screen bg-white">
    <section className="bg-stone-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-primary font-medium mb-3">Your Confidence</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Exchange Policy</h1>
        <p className="text-gray-600 text-lg">We stand behind every piece we make. If something isn't right, we'll make it right.</p>
      </div>
    </section>

    <section className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      {[
        {
          title: '7-Day Exchange Window',
          icon: '🔄',
          content: 'You have 7 days from the date of delivery to request an exchange for a different size or colour. Items must be unworn, undamaged, and returned with the original tags attached and packaging intact.'
        },
        {
          title: 'What Can Be Exchanged',
          icon: '✅',
          content: 'Size exchanges, colour exchanges on the same style. Items must be in their original condition — unwashed, unaltered, and with no signs of wear.'
        },
        {
          title: 'What Cannot Be Returned',
          icon: '❌',
          content: 'Items that have been worn, washed, altered, or damaged after delivery. Final sale items marked as non-returnable. Items returned after the 7-day window.'
        },
        {
          title: 'How to Request an Exchange',
          icon: '📧',
          content: 'Email us at support@rachbamcardigans.com with your order number and the reason for exchange. We will respond within 24–48 hours with a return address and instructions. Customer covers return shipping; we cover the re-delivery of the new item.'
        },
        {
          title: 'Knitwear Specific Notes',
          icon: '🧶',
          content: 'Knitwear is delicate. Pilling is normal and not a defect — our care guide (included with every order) explains how to maintain your piece. Loose threads should be gently tucked in rather than pulled. These are not defects and do not qualify for exchange.'
        },
        {
          title: 'Refunds',
          icon: '💳',
          content: 'We currently offer exchanges only, not cash refunds. In exceptional cases (e.g., manufacturing defect), a store credit or refund may be issued at our discretion. Contact us and we will find the best resolution.'
        },
      ].map(({ title, icon, content }) => (
        <div key={title} className="flex gap-5">
          <div className="text-3xl flex-shrink-0">{icon}</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{content}</p>
          </div>
        </div>
      ))}

      <div className="text-center border-t pt-10">
        <div className="flex justify-center gap-6 flex-wrap">
          <Link to="/faq" className="text-primary hover:underline font-medium">Read our FAQ →</Link>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition">
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default ReturnsPolicy;

