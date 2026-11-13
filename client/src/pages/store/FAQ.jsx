import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    category: 'Care & Maintenance',
    items: [
      { q: 'How do I wash my cardigan?', a: 'Hand wash in cold water with a gentle wool-friendly detergent. Avoid machine washing unless the care label specifically states it is safe. Rinse gently and do not wring.' },
      { q: 'My cardigan is pilling — is this a defect?', a: 'No, pilling is a natural characteristic of knitwear, especially in areas of friction (underarms, elbows). Use a fabric shaver or de-pilling comb on a low setting. It is included in our care guide.' },
      { q: 'How should I dry my cardigan?', a: 'Always dry flat in the shade on a clean dry towel. Never hang a wet cardigan — gravity will pull and distort the knit. Avoid direct sunlight which can fade the colour.' },
      { q: 'How do I store my cardigans?', a: 'Store folded, never hung. Hanging stretches the shoulders and body of the knit over time. Fold gently and store in a drawer or on a shelf.' },
      { q: 'Can I iron or steam my cardigan?', a: 'Steam is preferred over ironing. Hold a steamer 2–3cm from the surface without pressing down. If ironing, use the lowest setting with a damp cloth between the iron and the fabric.' },
    ]
  },
  {
    category: 'Sizing & Fit',
    items: [
      { q: 'How do I know which size to order?', a: 'Use our Size Guide which includes exact bust, waist, and garment length measurements. If you are between sizes, we recommend sizing up for a relaxed fit or true to size for a semi-fitted look.' },
      { q: 'Do cardigans stretch over time?', a: 'Quality knitwear retains its shape when cared for properly. Avoid hanging when wet, and store folded. Chunky knits may relax slightly with wear — this is normal and adds to the character.' },
      { q: 'What if my size is out of stock?', a: 'Sign up to our email list or check back regularly. We restock popular sizes. You can also contact us and we will notify you when your size returns.' },
    ]
  },
  {
    category: 'Shipping & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Within Lagos: 1–3 business days. Nationwide: 3–7 business days depending on your state. We ship via trusted logistics partners across all 36 states.' },
      { q: 'How is my order packaged?', a: 'Your cardigan is wrapped in tissue paper and sealed in a branded bag to protect the knit during transit. We take care to ensure it arrives looking exactly as it did when it left us.' },
      { q: 'Do you ship outside Nigeria?', a: 'Currently we ship within Nigeria only. International shipping is coming soon. Follow our Instagram for updates.' },
    ]
  },
  {
    category: 'Orders & Payments',
    items: [
      { q: 'Is payment secure?', a: "Yes. We use Paystack — Nigeria's most trusted payment gateway — which supports cards, bank transfers, and USSD payments with full encryption." },
      { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 2 hours of placement. After that, it may already be processed for dispatch. Contact us immediately at support@rachbamcardigans.com.' },
      { q: 'I entered the wrong address — what do I do?', a: 'Contact us immediately with your order number. If the order has not shipped yet, we can update the address at no extra cost.' },
    ]
  },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left font-medium text-gray-900 hover:text-primary transition"
      >
        {q}
        {open
          ? <ChevronUp size={18} className="flex-shrink-0 text-primary" />
          : <ChevronDown size={18} className="flex-shrink-0 text-gray-400" />}
      </button>
      {open && <div className="pb-5 text-gray-600 text-sm leading-relaxed">{a}</div>}
    </div>
  );
};

const FAQ = () => (
  <div className="min-h-screen bg-white">
    <section className="bg-stone-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-primary font-medium mb-3">Help Centre</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 text-lg">Everything you need to know about our cardigans, care, sizing, and delivery.</p>
      </div>
    </section>

    <section className="max-w-3xl mx-auto px-4 py-16 space-y-14">
      {FAQS.map(({ category, items }) => (
        <div key={category}>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary/20">{category}</h2>
          <div>
            {items.map(item => <FaqItem key={item.q} {...item} />)}
          </div>
        </div>
      ))}

      <div className="text-center border-t pt-10">
        <p className="text-gray-600 mb-4">Still have a question?</p>
        <a
          href="mailto:support@rachbamcardigans.com"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition"
        >
          Email Us
        </a>
      </div>
    </section>
  </div>
);

export default FAQ;

