import React from 'react';
import { useTasks } from '../../context/TaskContext';
import TaskCard from '../tasks/TaskCard';
import EmptyState from '../common/EmptyState';

const GridView = () => {
  const { filteredTasks } = useTasks();

  if (!filteredTasks.length) {
    return <EmptyState message="No tasks matching your filters" subtext="Try clearing your search or filters to see all tasks." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredTasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );
};

export default GridView;
