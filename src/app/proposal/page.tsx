'use client';

import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, XCircle, FileText, User, Loader2, List, Clock, Check, X, ChevronDown, ArrowLeft, ArrowRight, Undo2, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TeamMember {
  fullName: string;
  email: string;
  contactNumber: string;
  foodPreference: string;
  tshirtSize: string;
  allergies: string | null;
  role: string;
}

interface Proposal {
  id: string;
  teamName: string;
  projectFile: string | null;
  projectFileName: string | null;
  teamMembers: TeamMember[];
  approvalStatus: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function ProposalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || !session?.user.isJudge) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      const res = await fetch(`/api/proposal?status=${filter}`);
      const data = await res.json();
      setProposals(data);
      setCurrentIndex(0);
      setLoading(false);
    };

    const fetchStats = async () => {
      const res = await fetch('/api/proposal/stats');
      const data = await res.json();
      setStats(data);
    };

    if (session?.user.isJudge) {
      fetchProposals();
      fetchStats();
    }
  }, [session, filter]);

  const handleStatusUpdate = async (status: 'approved' | 'rejected' | 'pending') => {
    setLoading(true);
    const proposal = proposals[currentIndex];
    await fetch('/api/proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teamId: proposal.id, status }),
    });

    // Refresh proposals and stats after updating
    const [proposalsRes, statsRes] = await Promise.all([
      fetch(`/api/proposal?status=${filter}`),
      fetch('/api/proposal/stats'),
    ]);
    const [proposalsData, statsData] = await Promise.all([
      proposalsRes.json(),
      statsRes.json(),
    ]);
    setProposals(proposalsData);
    setStats(statsData);
    setCurrentIndex(0);
    setLoading(false);
  };

  const viewProposal = () => {
    const proposal = proposals[currentIndex];
    if (proposal.projectFile) {
      // Remove the data URI prefix if it exists
      const base64String = proposal.projectFile.split(',')[1] || proposal.projectFile;
      try {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      } catch (error) {
        console.error("Error decoding base64 string:", error);
        alert("Failed to open PDF. The file may be corrupt or improperly formatted.");
      }
    }
  }

  const handleNext = () => {
    if (currentIndex < proposals.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (status === 'loading' || !session?.user.isJudge) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <Smartphone className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">This page is best viewed on a larger screen.</h2>
        <p>Please switch to a desktop or tablet for the best experience. Or else, the UI will self-destruct in 5 seconds.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Proposal Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5" />
              <p className="font-bold">Total:</p>
              <p>{stats.total}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <p className="font-bold">Pending:</p>
              <p>{stats.pending}</p>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <p className="font-bold">Approved:</p>
              <p>{stats.approved}</p>
            </div>
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              <p className="font-bold">Rejected:</p>
              <p>{stats.rejected}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Teams</CardTitle>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm">Filter by:</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={loading} className="flex items-center gap-2">
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('pending')}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('approved')}>Approved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('rejected')}>Rejected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((p, index) => (
                    <TableRow key={p.id} onClick={() => setCurrentIndex(index)} className={`cursor-pointer ${currentIndex === index ? 'bg-muted' : ''}`}>
                      <TableCell>{p.teamName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.approvalStatus === 'approved'
                              ? 'success'
                              : p.approvalStatus === 'rejected'
                              ? 'destructive'
                              : 'warning'
                          }
                        >
                          {p.approvalStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-2 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : proposals.length > 0 ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button onClick={handlePrevious} disabled={loading || currentIndex === 0} className="w-28"><ArrowLeft className="h-5 w-5 mr-2" />Previous</Button>
                <Button onClick={handleNext} disabled={loading || currentIndex === proposals.length - 1} className="w-28"><ArrowRight className="h-5 w-5 mr-2" />Next</Button>
                <Button onClick={viewProposal} disabled={loading}><FileText className="h-5 w-5 mr-2" />View Proposal</Button>
                {proposals[currentIndex].approvalStatus === 'pending' ? (
                  <>
                    <Button variant="success" onClick={() => handleStatusUpdate('approved')} disabled={loading} className="w-28">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={loading}
                      className="w-28"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}Reject
                    </Button>
                  </>
                ) : (
                  <Button variant="warning" onClick={() => handleStatusUpdate('pending')} disabled={loading} className="w-28">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Undo2 className="h-5 w-5 mr-2" />}Revoke
                  </Button>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <p className="font-bold">Team Name:</p>
                  <p>{proposals[currentIndex].teamName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">Registration Status:</p>
                  <p>{proposals[currentIndex].approvalStatus}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposals[currentIndex].teamMembers.map((member) => (
                      <TableRow key={member.email}>
                        <TableCell>{member.fullName}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === 'leader' ? 'default' : 'member'}>
                            {member.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center">No {filter} proposals.</div>
        )}
      </div>
    </div>
  );
}
