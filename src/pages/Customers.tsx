import React, { useState } from 'react';
import { Users, Search, Eye, UserCheck, IndianRupee } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CustomerDetailsModal } from '../components/customers/CustomerDetailsModal';

export const Customers: React.FC = () => {
  const { customers } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const search = (searchTerm || '').toLowerCase();
    const name = (c?.name || '').toLowerCase();
    const email = (c?.email || '').toLowerCase();
    const phone = c?.phone || '';
    return name.includes(search) || email.includes(search) || phone.includes(search);
  });

  const totalClientSpend = customers.reduce((acc, c) => acc + (Number(c?.totalSpent) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Clientele & VIP Accounts
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Maintain relationship records, order history, and account privileges for KINORA patrons.
          </p>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center text-gold-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-zinc-400">Total Patrons</p>
            <p className="text-lg font-bold text-white mt-0.5">{customers.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-zinc-400">Total Client Spend</p>
            <p className="text-lg font-bold text-gold-light mt-0.5">
              ₹{totalClientSpend.toLocaleString('en-IN')}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-zinc-400">Active Membership</p>
            <p className="text-lg font-bold text-white mt-0.5">
              {customers.filter((c) => c.status === 'active').length} VIPs
            </p>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="max-w-md">
          <Input
            placeholder="Search patrons by name, email, or telephone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="text-xs"
          />
        </div>
      </Card>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Customers Found"
          description="No clients match your search criteria."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#16161a] text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-semibold">Client Name</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Orders</th>
                  <th className="p-4 font-semibold">Total Spent</th>
                  <th className="p-4 font-semibold">Member Since</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black border border-gold-primary/30 overflow-hidden shrink-0">
                          {cust.avatar ? (
                            <img src={cust.avatar} alt={cust.name || 'Patron'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold">
                              {(cust.name || 'P').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-gold-light transition-colors">
                            {cust.name || 'Anonymous Patron'}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">ID: {cust.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-zinc-300">{cust.email || 'No email provided'}</p>
                      {cust.phone && <p className="text-[10px] text-zinc-500">{cust.phone}</p>}
                    </td>
                    <td className="p-4 font-semibold text-zinc-300">
                      {cust.ordersCount ?? 0} order{(cust.ordersCount ?? 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="p-4 font-bold text-gold-light">
                      ₹{(Number(cust.totalSpent) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-zinc-400">
                      {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <Badge variant={cust.status === 'active' ? 'success' : 'danger'}>
                        {cust.status === 'active' ? 'Active VIP' : 'Blocked'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        leftIcon={<Eye className="w-3.5 h-3.5 text-gold-primary" />}
                      >
                        Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
      />
    </div>
  );
};
