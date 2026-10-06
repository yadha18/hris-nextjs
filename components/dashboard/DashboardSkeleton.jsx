import { Card } from '@/components/ui/Card';
import StatGrid from '@/components/ui/StatGrid';

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

function SkeletonRows({ count, heightClass }) {
  return Array.from({ length: count }, (_, index) => (
    <Skeleton key={index} className={`mb-2 rounded-lg last:mb-0 ${heightClass}`} />
  ));
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-surface px-[18px] py-4">
      <Skeleton className="mb-2.5 h-[11px] w-[70%]" />
      <Skeleton className="h-6 w-[45%]" />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <StatGrid desktopColumns={5}>
        {Array.from({ length: 5 }, (_, index) => <StatCardSkeleton key={index} />)}
      </StatGrid>
      <StatGrid desktopColumns={4}>
        {Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)}
      </StatGrid>
      <Card>
        <Skeleton className="mb-4 h-3.5 w-[220px]" />
        <Skeleton className="h-[180px] rounded-[10px]" />
      </Card>
      <Card>
        <Skeleton className="mb-4 h-3.5 w-[220px]" />
        <SkeletonRows count={3} heightClass="h-12" />
      </Card>
      <Card>
        <Skeleton className="mb-4 h-3.5 w-[220px]" />
        <SkeletonRows count={5} heightClass="h-[42px]" />
      </Card>
    </>
  );
}