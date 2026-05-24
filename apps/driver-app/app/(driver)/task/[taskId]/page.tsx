import { TaskDetail } from '@/components/task-detail';

type TaskPageProps = {
  params: { taskId: string };
};

export default function TaskPage({ params }: TaskPageProps) {
  return <TaskDetail taskId={params.taskId} />;
}
