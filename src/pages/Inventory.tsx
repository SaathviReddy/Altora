import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, ArrowUpDown, DollarSign } from 'lucide-react';
import { api, InventoryItem } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Add item form
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  const loadInventory = async () => {
    try {
      const data = await api.inventory.getItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !costPrice || !sellingPrice) return;

    try {
      await api.inventory.addItem(
        name,
        Number(quantity),
        Number(costPrice),
        Number(sellingPrice)
      );
      setName('');
      setQuantity('');
      setCostPrice('');
      setSellingPrice('');
      setModalOpen(false);
      loadInventory(); // reload
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQty = async (id: string, currentQty: number, change: number) => {
    const newQty = Math.max(0, currentQty + change);
    try {
      await api.inventory.updateStock(id, newQty);
      loadInventory();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Skeleton message="Reviewing your business context..." />;
  }

  // Aggregate metrics
  const totalStockValue = items.reduce((acc, curr) => acc + (curr.quantity * curr.sellingPrice), 0);
  const totalAssetCost = items.reduce((acc, curr) => acc + (curr.quantity * curr.costPrice), 0);
  const lowStockCount = items.filter(i => i.status === 'low_stock').length;
  const outOfStockCount = items.filter(i => i.status === 'out_of_stock').length;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold">ASSET CATALOG</span>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">Inventory Hub</h1>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)} className="mt-4 sm:mt-0">
          <Plus size={14} className="mr-2" /> Add Catalog Item
        </Button>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border border-charcoal/5 bg-ivory">
          <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Total Stock Value</span>
          <p className="text-2xl font-serif font-semibold text-charcoal mt-1">
            ${totalStockValue.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center text-[10px] text-gold font-bold">
            <DollarSign size={12} /> Retail projection price
          </div>
        </Card>

        <Card className="p-6 border border-charcoal/5 bg-ivory">
          <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Asset Capital Cost</span>
          <p className="text-2xl font-serif font-semibold text-charcoal/80 mt-1">
            ${totalAssetCost.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center text-[10px] text-brown font-semibold">
            <Package size={12} className="mr-1" /> Initial acquisition cost
          </div>
        </Card>

        <Card className="p-6 border border-charcoal/5 bg-ivory">
          <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Low Stock Warnings</span>
          <p className="text-2xl font-serif font-semibold text-charcoal mt-1">
            {lowStockCount}
          </p>
          <div className="mt-4 flex items-center text-[10px] text-brown font-semibold">
            <AlertTriangle size={12} className="mr-1 text-gold" /> Reorder threshold hit
          </div>
        </Card>

        <Card className="p-6 border border-charcoal/5 bg-ivory">
          <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Depleted Assets</span>
          <p className="text-2xl font-serif font-semibold text-charcoal mt-1">
            {outOfStockCount}
          </p>
          <div className="mt-4 flex items-center text-[10px] text-brown font-semibold">
            <AlertTriangle size={12} className="mr-1 text-red-500" /> Out of stock items
          </div>
        </Card>
      </div>

      {/* Catalog spreadsheet list */}
      <Card className="p-6 border border-charcoal/10 bg-ivory space-y-4">
        <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
          Products Catalog Listing
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal font-sans">
            <thead>
              <tr className="border-b border-charcoal/10 font-serif font-semibold text-brown">
                <th className="pb-3">Product Description</th>
                <th className="pb-3 px-4">Stock Status</th>
                <th className="pb-3 px-4 text-center">Quantity (Units)</th>
                <th className="pb-3 text-right">Cost Price</th>
                <th className="pb-3 text-right">Retail Price</th>
                <th className="pb-3 text-right">Total Potential Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-cream/10">
                  <td className="py-3.5 font-serif font-semibold text-charcoal text-sm">{item.name}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${item.status === 'in_stock' ? 'bg-green-50 text-green-800 border border-green-200' : item.status === 'low_stock' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                        className="px-2 py-0.5 border border-charcoal/10 hover:border-charcoal/30 bg-cream/40 rounded focus:outline-none"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-semibold w-8">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                        className="px-2 py-0.5 border border-charcoal/10 hover:border-charcoal/30 bg-cream/40 rounded focus:outline-none"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-mono text-brown">${item.costPrice}</td>
                  <td className="py-3.5 text-right font-mono text-charcoal font-semibold">${item.sellingPrice}</td>
                  <td className="py-3.5 text-right font-mono font-semibold text-gold">
                    ${(item.quantity * item.sellingPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Catalog Item"
      >
        <form onSubmit={handleAddItem} className="space-y-5">
          <Input
            label="Product Name"
            placeholder="e.g. Premium Brand Strategy Guidebook"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              placeholder="e.g. 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <Input
              label="Cost Price ($)"
              type="number"
              placeholder="e.g. 12"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              required
            />
            <Input
              label="Retail Price ($)"
              type="number"
              placeholder="e.g. 35"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2">
            Commit Catalog Item
          </Button>
        </form>
      </Modal>

    </div>
  );
};
