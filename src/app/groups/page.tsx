'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  Users, 
  Plus, 
  ArrowRight, 
  Search,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface Group {
  id: string
  name: string
  description?: string | null
  memberCount: number
  totalPool: number
  interestRate: number
  isOwner: boolean
  termEndDate: string
}

// Mock data for demo
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Family Savings Circle',
    description: 'Our family sinking fund for emergencies and big purchases',
    memberCount: 8,
    totalPool: 156000,
    interestRate: 5,
    isOwner: true,
    termEndDate: '2026-12-31'
  },
  {
    id: '2',
    name: 'Office Fund Group',
    description: 'Colleague savings group for shared goals',
    memberCount: 12,
    totalPool: 284500,
    interestRate: 5,
    isOwner: false,
    termEndDate: '2026-12-31'
  },
  {
    id: '3',
    name: 'Friends Investment Club',
    description: 'Monthly savings with trusted friends',
    memberCount: 5,
    totalPool: 75000,
    interestRate: 5,
    isOwner: true,
    termEndDate: '2026-06-30'
  }
]

export default function GroupsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'owned' | 'member'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
    if (user) {
      fetchGroups()
    }
  }, [user, authLoading])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      // TODO: Replace with real API call
      // const response = await fetch('/api/groups')
      // const data = await response.json()
      // setGroups(data.groups)
      
      // Using mock data for demo
      await new Promise(resolve => setTimeout(resolve, 500))
      setGroups(mockGroups)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGroups = groups.filter(group => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'owned' && group.isOwner) ||
      (filter === 'member' && !group.isOwner)
    
    const matchesSearch = 
      searchQuery === '' ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const stats = {
    totalGroups: groups.length,
    ownedGroups: groups.filter(g => g.isOwner).length,
    totalPool: groups.reduce((sum, g) => sum + g.totalPool, 0)
  }

  if (loading || authLoading) {
    return (
      <DashboardLayout title="Groups">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Groups">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-sage-dim rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-sage" />
              </div>
              <div>
                <p className="text-sm text-charcoal-muted">Total Groups</p>
                <p className="font-display text-2xl text-charcoal">{stats.totalGroups}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-terracotta-dim rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-terracotta" />
              </div>
              <div>
                <p className="text-sm text-charcoal-muted">Groups You Own</p>
                <p className="font-display text-2xl text-charcoal">{stats.ownedGroups}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-sage-dim rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-sage" />
              </div>
              <div>
                <p className="text-sm text-charcoal-muted">Total Pool Value</p>
                <p className="font-display text-2xl text-charcoal">{formatCurrency(stats.totalPool)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl text-charcoal">Your Groups</h2>
            <p className="text-charcoal-muted">Manage and view all your sinking fund groups</p>
          </div>
          <Button onClick={() => router.push('/groups/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Group
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-muted" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-black/[0.08] bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'owned', 'member'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === filterOption
                    ? 'bg-sage text-white'
                    : 'bg-white text-charcoal-secondary hover:bg-black/[0.03]'
                }`}
              >
                {filterOption === 'all' ? 'All' : filterOption === 'owned' ? 'Owned' : 'Member'}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-sage" />
              </div>
              <h3 className="font-display text-xl text-charcoal mb-2">
                {searchQuery ? 'No Groups Found' : 'No Groups Yet'}
              </h3>
              <p className="text-charcoal-secondary mb-6">
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first sinking fund group to start saving together'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push('/groups/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <Card 
                  className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full" 
                  onClick={() => router.push(`/groups/${group.id}`)}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-sage rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg text-charcoal">{group.name}</h3>
                            {group.isOwner && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-sage-dim text-sage rounded-full">
                                Owner
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-charcoal-muted line-clamp-2 mt-1">
                            {group.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-sage flex-shrink-0" />
                    </div>

                    <div className="flex-1" />

                    <div className="space-y-3 pt-4 border-t border-black/[0.06]">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-charcoal-muted">
                          <Users className="w-4 h-4" />
                          <span>{group.memberCount} members</span>
                        </div>
                        <span className="font-mono text-sage">{group.interestRate}% interest</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-charcoal-muted">
                          <DollarSign className="w-4 h-4" />
                          <span>Pool: {formatCurrency(group.totalPool)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-charcoal-muted">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(group.termEndDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
