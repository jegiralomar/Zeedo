import React from 'react';
import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Package, MapPin, Phone, User, Clock, CheckCircle2, Navigation } from 'lucide-react';

export const revalidate = 0; // Dynamic route

export default async function LogisticsDriverPage({ params }: { params: { id: string } }) {
  const sql = getDb();
  
  // Fetch auction details
  const auctions = await sql`
    SELECT * FROM auctions WHERE id = ${params.id}
  `;
  const auction = auctions[0];

  if (!auction) {
    notFound();
  }

  // Fetch winning bid and buyer details if auction ended
  let buyer = null;
  let winningBid = null;

  if (auction.status === 'ended') {
    const bids = await sql`
      SELECT * FROM bids 
      WHERE auction_id = ${auction.id} 
      ORDER BY amount_iqd DESC LIMIT 1
    `;
    winningBid = bids[0];

    if (winningBid) {
      const users = await sql`
        SELECT * FROM users WHERE id = ${winningBid.user_id}
      `;
      buyer = users[0];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1e293b] p-6 pb-8 relative rounded-b-[40px] shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-xl font-black text-white tracking-tight">ZEEDO<span className="text-emerald-400">LOGISTICS</span></h1>
            <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
              <span className="text-white text-xs font-bold uppercase tracking-wider">{auction.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {auction.image_url ? (
              <img src={auction.image_url} className="w-16 h-16 rounded-xl object-cover border-2 border-white/10" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border-2 border-white/10">
                <Package className="text-white/50" />
              </div>
            )}
            <div>
              <h2 className="text-white font-semibold line-clamp-2 text-sm leading-tight">{auction.title_ar || auction.title_en}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${auction.status === 'ended' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {auction.status === 'ended' ? 'SOLD' : 'IN INVENTORY'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 -mt-4 relative z-10">
          
          {auction.status !== 'ended' ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Item Not Sold Yet</h3>
              <p className="text-sm text-gray-500">This package is currently in inventory. Check back after the auction ends to view buyer delivery details.</p>
            </div>
          ) : !buyer ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
               <h3 className="text-lg font-bold text-gray-900">No Winner</h3>
               <p className="text-sm text-gray-500">The auction ended without a winning bid.</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Ready for Delivery</p>
                  <p className="text-sm text-emerald-600 font-medium">To be collected: <span className="font-bold text-emerald-700">{winningBid.amount_iqd.toLocaleString()} IQD</span></p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 uppercase">Buyer Details</span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Name</p>
                      <p className="font-bold text-gray-900">{buyer.name}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Phone</p>
                      <p className="font-bold text-gray-900" dir="ltr">{buyer.phone}</p>
                    </div>
                    <a href={`tel:${buyer.phone}`} className="bg-[#1e293b] text-white p-2.5 rounded-xl shadow-md">
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 uppercase">Delivery Location</span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 font-medium mb-1">City / Region</p>
                  <p className="font-bold text-gray-900 mb-4">{buyer.city || 'Not specified'}</p>

                  <p className="text-sm text-gray-500 font-medium mb-1">Full Address</p>
                  <p className="font-medium text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {buyer.delivery_address || 'Detailed address not provided.'}
                  </p>

                  {buyer.gps_lat && buyer.gps_lng ? (
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${buyer.gps_lat},${buyer.gps_lng}`}
                      target="_blank"
                      className="mt-4 w-full bg-[#1e293b] hover:bg-black text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate to GPS Location
                    </a>
                  ) : (
                    <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 font-medium">Exact GPS coordinates were not captured for this buyer.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
