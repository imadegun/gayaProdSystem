'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Filter, Eye, Edit, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Collection {
  id: string
  code: string
  name: string
  collectionType: 'R&D' | 'Exclusive' | 'Exclusive-Group' | 'General'
  isApproved: boolean
  isOrdered: boolean
  clientCode?: string
  clientDescription?: string
  categoryName?: string
  colorName?: string
  materialName?: string
  sizeName?: string
  textureName?: string
  createdAt: string
  updatedAt: string
}

export default function RNDCollectionsPage() {
  const { data: session } = useSession()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/rnd/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data)
      } else {
        toast.error('Failed to fetch collections')
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
      toast.error('Error fetching collections')
    } finally {
      setLoading(false)
    }
  }

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'approved' && collection.isApproved) ||
                         (statusFilter === 'pending' && !collection.isApproved) ||
                         (statusFilter === 'ordered' && collection.isOrdered)
    const matchesType = typeFilter === 'all' || collection.collectionType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (collection: Collection) => {
    if (collection.isOrdered) {
      return <Badge variant="default" className="bg-green-500">Ordered</Badge>
    } else if (collection.isApproved) {
      return <Badge variant="secondary" className="bg-blue-500">Approved</Badge>
    } else {
      return <Badge variant="outline">Draft</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      'R&D': 'outline',
      'Exclusive': 'default',
      'Exclusive-Group': 'secondary',
      'General': 'outline'
    }
    return <Badge variant={variants[type as keyof typeof variants] || 'outline'}>{type}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading collections...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Collections Management</h1>
          <p className="text-muted-foreground">Manage your R&D collections and track their progress</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Collection
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="R&D">R&D</SelectItem>
                <SelectItem value="Exclusive">Exclusive</SelectItem>
                <SelectItem value="Exclusive-Group">Exclusive-Group</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{collection.code}</CardTitle>
                  <CardDescription>{collection.name}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(collection)}
                  {getTypeBadge(collection.collectionType)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {collection.clientDescription && (
                  <div><strong>Client:</strong> {collection.clientDescription}</div>
                )}
                {collection.categoryName && (
                  <div><strong>Category:</strong> {collection.categoryName}</div>
                )}
                <div><strong>Created:</strong> {new Date(collection.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                {!collection.isApproved && (
                  <Button variant="outline" size="sm" className="text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">No collections found</div>
          <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Collection
          </Button>
        </div>
      )}

      {/* Create Collection Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Start a new R&D collection for product development
            </DialogDescription>
          </DialogHeader>
          {/* Collection creation form will be implemented here */}
          <div className="text-center py-8 text-muted-foreground">
            Collection creation form coming soon...
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}