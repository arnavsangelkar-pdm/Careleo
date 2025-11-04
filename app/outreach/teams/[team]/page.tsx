import { notFound } from 'next/navigation';
import { OUTREACH_TEAMS } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateMockMembers, generateMockOutreach } from '@/lib/mock';
import { countByChannel, seriesFromCounts } from '@/lib/selectors.analytics';
import { ChannelDistribution } from '@/components/charts/ChannelDistribution';
import { 
  Users, 
  Phone, 
  MessageSquare, 
  Mail, 
  Monitor,
  TrendingUp,
  Calendar,
  User,
  ArrowLeft,
  Home
} from 'lucide-react';
import Link from 'next/link';

// Helper function to group data by key
function groupCount<T, K extends string | number>(arr: T[], keyFn: (t: T) => K) {
  return arr.reduce<Record<string, number>>((acc, cur) => {
    const k = String(keyFn(cur));
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

export default function TeamPage({ params }: { params: { team: string } }) {
  const team = decodeURIComponent(params.team);
  if (!OUTREACH_TEAMS.includes(team as any)) return notFound();

  // Generate mock data
  const members = generateMockMembers(50);
  const allOutreach = generateMockOutreach(members, 200);
  
  // Filter outreach for this team
  const outreach = allOutreach.filter(o => o.team === team);

  // Derive metrics
  const total = outreach.length;
  const completed = outreach.filter(o => o.status === 'Completed').length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  const byChannel = groupCount(outreach, o => o.channel);
  const byStatus = groupCount(outreach, o => o.status);
  const byAgent = groupCount(outreach, o => o.agent);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Call': return Phone
      case 'SMS': return MessageSquare
      case 'Email': return Mail
      case 'Portal': return Monitor
      default: return MessageSquare
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'default'
      case 'In-Progress': return 'secondary'
      case 'Failed': return 'destructive'
      default: return 'outline'
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/" className="flex items-center gap-1 hover:text-gray-700">
          <Home className="h-4 w-4" />
          Home
        </Link>
        <span>/</span>
        <Link href="/" className="hover:text-gray-700">
          Outreach
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{team}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Outreach
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{team}</h1>
            <p className="text-gray-500">Team performance and outreach metrics</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {total} total outreach
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Outreach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
            <p className="text-xs text-gray-500">All channels</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <p className="text-xs text-gray-500">Success rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(byAgent).length}</div>
            <p className="text-xs text-gray-500">Team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChannelDistribution data={seriesFromCounts(byChannel)} />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(byChannel).map(([channel, count]) => {
              const ChannelIcon = getChannelIcon(channel);
              const percentage = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={channel} className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ChannelIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-500">{channel}</div>
                  <div className="text-xs text-gray-400">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(byStatus).map(([status, count]) => {
              const percentage = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(status)}>
                      {status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <span className="text-sm text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Outreach */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Outreach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {outreach.slice(0, 10).map((entry) => {
              const ChannelIcon = getChannelIcon(entry.channel);
              return (
                <div 
                  key={entry.id} 
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <ChannelIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{entry.topic}</h4>
                          <Badge variant={getStatusVariant(entry.status)} className="text-xs">
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{entry.note}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{entry.memberName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                          </div>
                          <span>Agent: {entry.agent}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {entry.channel}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Top Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(byAgent)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([agent, count]) => (
                <div key={agent} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-medium">{agent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{count}</span>
                    <span className="text-sm text-gray-500">outreach</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
