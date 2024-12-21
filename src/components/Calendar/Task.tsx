import { ITodoTask, IDay, useCalendar, MonthStore } from '@/lib/store/CNCalender';
import { H4, P } from '@/components/ui/typography';
import { useState, useRef, useEffect } from 'react';

interface IProps {
  day: IDay,
  droppedTask: ITodoTask|undefined,
  isDraggable: boolean,
}

export default ({ droppedTask, day , isDraggable}: IProps) => {

  const calendar = useCalendar<MonthStore>(day.month);
  const isCreated = droppedTask ? '__created' : '';
  const [isMouseEnter, setTriggerMouseEnter] = useState(false);


  function handleDragEndTask() {
    if(calendar.refDayAndTask.day) {
      let index = 0;
      for(const task of day.tasks) {
        if(task === droppedTask) {
          const [droppedTodo] = day.tasks.splice(index, 1);
          const dayIndex = calendar.refDayAndTask.day.day;
          calendar.addTaskToDay(day.day, dayIndex, droppedTodo)
          return false; 
        }
        index++;
      }
    }
  }

  function handleDragStartTask(ev:React.DragEvent<HTMLDivElement>) {
    ev.dataTransfer.effectAllowed = "move";
  }

  const handleDragOverTask = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault(); 
    ev.dataTransfer.dropEffect = "move";
  };


  function handleMouseDown () {
    setTriggerMouseEnter(false);
  }
  function handleMouseUp () {
    setTriggerMouseEnter(true);
  }

  function handleMouseEnter () {
   !!droppedTask && setTriggerMouseEnter(true);
  }

  function handleMouseLeave () {
   !!droppedTask && setTriggerMouseEnter(false);
  }
  return (
    <div 
      draggable={isDraggable}
      onDragOver={handleDragOverTask}
      onDragEnd={handleDragEndTask} 
      onDragStart={handleDragStartTask}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`Calendar__days-task ${isCreated}`}
    > 
    {
      (isCreated && isMouseEnter && droppedTask?.title) && (
        <OverLap {...droppedTask}/>
      )
    }
    </div>
  );
};

function OverLap({title, description}: ITodoTask) {
  const ref = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<'LEFT'|'RIGHT'>('LEFT');
  const [isShowed, setIsShowed] = useState<'__active'|undefined>();

  useEffect(() => {
    const wScreen = window.innerWidth;
    const overlap = ref.current?.getBoundingClientRect()!;
    const result = Math.abs(overlap.left - wScreen) >  overlap.width;
    setSide(result ? 'LEFT' : 'RIGHT');
    setIsShowed('__active');
  }, [])

  return (
    <div ref={ref} className={`Calendar__days-task__overlap ${isShowed} ${side === 'LEFT' ? 'left-full' : 'right-full'}`}>
      <H4>{title}</H4>
      {description && (
        <P>{description}</P>
      )}
    </div>
  )
}