import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SIZE_CHART = [
  { size: 'XS',  uk: '6-8',   us: '2-4',   eu: '34-36', bust: '78-82cm',   waist: '60-64cm', length: '62cm' },
  { size: 'S',   uk: '8-10',  us: '4-6',   eu: '36-38', bust: '82-86cm',   waist: '64-68cm', length: '64cm' },
  { size: 'M',   uk: '10-12', us: '6-8',   eu: '38-40', bust: '86-91cm',   waist: '68-73cm', length: '66cm' },
  { size: 'L',   uk: '12-14', us: '8-10',  eu: '40-42', bust: '91-97cm',   waist: '73-79cm', length: '68cm' },
  { size: 'XL',  uk: '14-16', us: '10-12', eu: '42-44', bust: '97-104cm',  waist: '79-86cm', length: '70cm' },
  { size: '2XL', uk: '16-18', us: '12-14', eu: '44-46', bust: '104-112cm', waist: '86-94cm', length: '72cm' },
];

const SizeGuide = () => (
  <div className="min-h-screen bg-white">
    <section className="bg-stone-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-primary font-medium mb-3">Fit Confidence</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Size & Fit Guide</h1>
        <p className="text-gray-600 text-lg">We want you to love how your cardigan fits — use this guide to find your perfect size.</p>
      </div>
    </section>

    <section className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      {/* How to Measure */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Measure Yourself</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Bust / Chest', icon: '📏', desc: 'Measure around the fullest part of your chest, keeping the tape parallel to the floor. Wear a bra you would normally wear.' },
            { label: 'Waist', icon: '〰️', desc: 'Measure around your natural waistline — the narrowest part of your torso, usually just above your belly button.' },
            { label: 'Garment Length', icon: '📐', desc: 'For reference, our garment lengths are measured from the highest shoulder point to the hemline at the center back.' },
          ].map(({ label, icon, desc }) => (
            <div key={label} className="bg-stone-50 rounded-2xl p-6">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{label}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Size Chart */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Size Chart</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50">
                {['Size', 'UK', 'US', 'EU', 'Bust', 'Waist', 'Length'].map(h => (
                  <th key={h} className="px-4 py-4 text-left font-semibold text-gray-900 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row, i) => (
                <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                  <td className="px-4 py-4 font-bold text-primary">{row.size}</td>
                  <td className="px-4 py-4 text-gray-600">{row.uk}</td>
                  <td className="px-4 py-4 text-gray-600">{row.us}</td>
                  <td className="px-4 py-4 text-gray-600">{row.eu}</td>
                  <td className="px-4 py-4 text-gray-600">{row.bust}</td>
                  <td className="px-4 py-4 text-gray-600">{row.waist}</td>
                  <td className="px-4 py-4 text-gray-600">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">* All measurements are in centimetres. Garment measurements may vary ±2cm due to hand-finishing.</p>
      </div>

      {/* Fit Tips */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fit & Style Tips</h2>
        <div className="space-y-4">
          {[
            ['Relaxed Oversized Look', 'Size up 1 from your usual size for a loose, drape-forward layered silhouette.'],
            ['True to Size / Semi-fitted', 'Order your regular measured size for a classic fit that skims the body.'],
            ['Chunky Knits', 'Size up at least 1 — the thicker yarn adds visual and physical bulk, so a relaxed fit is more flattering.'],
            ['Duster Lengths', 'These are designed to fall long — length is consistent across sizes, so focus on bust/shoulder fit.'],
          ].map(([title, tip]) => (
            <div key={title} className="bg-stone-50 rounded-xl p-4 flex gap-4">
              <div className="text-primary font-bold text-lg flex-shrink-0">→</div>
              <div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-600 mt-1">{tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center border-t pt-10">
        <p className="text-gray-600 mb-4">Still unsure? Our size guide is free to exchange — see our returns policy.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/returns" className="text-primary hover:underline font-medium">Returns Policy →</Link>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition">
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default SizeGuide;

