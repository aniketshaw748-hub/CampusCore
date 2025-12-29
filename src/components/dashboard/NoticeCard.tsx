import { formatDistanceToNow, format, isPast, differenceInHours } from 'date-fns';
import { Calendar, Clock, FileText, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FacultyUpload } from '@/types';
import { cn } from '@/lib/utils';

interface NoticeCardProps {
  notice: FacultyUpload;
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const hasDeadline = !!notice.deadline;
  const deadlineDate = notice.deadline ? new Date(notice.deadline) : null;
  const isOverdue = deadlineDate ? isPast(deadlineDate) : false;
  const hoursUntilDeadline = deadlineDate ? differenceInHours(deadlineDate, new Date()) : null;
  const isUrgent = hoursUntilDeadline !== null && hoursUntilDeadline <= 72 && hoursUntilDeadline > 0;

  const getUrgencyStyles = () => {
    if (isOverdue) return 'border-l-destructive bg-destructive/5';
    if (notice.urgency === 'high' || isUrgent) return 'border-l-urgency-high bg-urgency-high/5';
    if (notice.urgency === 'medium') return 'border-l-urgency-medium bg-urgency-medium/5';
    return 'border-l-urgency-low';
  };

  const getContentTypeLabel = () => {
    switch (notice.content_type) {
      case 'notice': return 'Notice';
      case 'syllabus': return 'Syllabus';
      case 'study_material': return 'Study Material';
      case 'assignment': return 'Assignment';
      default: return 'Content';
    }
  };

  return (
    <div className={cn(
      'p-4 rounded-xl bg-card border border-border border-l-4 hover:shadow-card-hover transition-all duration-200',
      getUrgencyStyles()
    )}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
              {getContentTypeLabel()}
            </span>
            {notice.is_exam_related && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                Exam Related
              </span>
            )}
            {isUrgent && !isOverdue && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-urgency-high/10 text-urgency-high">
                <AlertTriangle className="w-3 h-3" />
                Urgent
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-lg mb-1">{notice.title}</h3>
          
          {notice.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {notice.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
            </div>
            
            {hasDeadline && (
              <div className={cn(
                'flex items-center gap-1.5',
                isOverdue ? 'text-destructive' : isUrgent ? 'text-urgency-high font-medium' : ''
              )}>
                <Calendar className="w-4 h-4" />
                {isOverdue 
                  ? 'Deadline passed' 
                  : `Due ${format(deadlineDate!, 'MMM d, yyyy')}`
                }
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notice.file_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={notice.file_url} target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4" />
                View File
              </a>
            </Button>
          )}
          {hasDeadline && !isOverdue && (
            <Button variant="ghost" size="sm">
              <Calendar className="w-4 h-4" />
              Add to Calendar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
