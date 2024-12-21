import Task from './Task';
import {
  Popover,
} from "@/components/ui/MyPopover"
import TaskForm from './TaskFrom';
import { IDay, ITodoTask, MonthStore, useCalendar } from "@/lib/store/CNCalender";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription} from "@/components/ui/sheet";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { H4, H5, P, Span } from '@/components/ui/typography';
import { memo, useMemo,  useRef,  useState } from 'react';
import { Plus , ClipboardList, Eye, Pencil} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResizableBox from '@/components/ui/ResizableBox';
import DraggableBox from "@/components/ui/DraggableBox";
import { Checkbox } from "@/components/ui/checkbox";


interface IProps {
  day: IDay,
  dayName: string,
  isNextMonth: boolean
}

const areEqual = (prevProps:IProps, nextProps:IProps) => {
  return (
    prevProps.day === nextProps.day &&
    prevProps.day.tasks.length === nextProps.day.tasks.length
  );
};

export default  memo(({ day, isNextMonth, dayName }: IProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const refPopoverStartCoords = useRef({x:0, y:0});
  const calendar = useCalendar<MonthStore>(day.month);
  const tasksToRender = useMemo(() => {
    return [...day.tasks, ...Array.from({ length: 14 - day.tasks.length })];
  }, [day]);

  const handleDragOverTask = () => {
    calendar.refDayAndTask.day = day;
  };

  function closePopover () {
    setIsOpen(false);
  }

  function openPopover (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    setIsOpen(true);
    refPopoverStartCoords.current = {
      x: ev.clientX,
      y: ev.clientY
    }
  }
  return (
    <Sheet>
        <Popover isOpen={isOpen} >
          <DraggableBox startCoords={refPopoverStartCoords} parentIDorClassName="Calendars">
            <ResizableBox className="lg:min-w-full">
                <TaskForm {...day} toClose={closePopover}/>
              </ResizableBox>
          </DraggableBox>
        </Popover>
        <div className={`Calendar__days-numbers__item ${isNextMonth ? "__strangerDay" : ""}`} onDragOver={handleDragOverTask}>
          <H4><Span>{dayName}</Span> {day.day}</H4>
          <div className="wrapper">
            <div className="container">
              <SheetTrigger className="sheet__trigger Calendar__days-task __action">
                <div>
                  <ClipboardList/>
                </div>
              </SheetTrigger>
              <div className={`Calendar__days-task __action cursor-pointer`} onClick={openPopover}>
                <Plus/>
              </div>
              {tasksToRender.map((task, indexTask) => (
                <Task 
                  day={day}
                  key={indexTask} 
                  isDraggable={true}
                  droppedTask={task as (ITodoTask|undefined)}
                />
              ))}
            </div>
          </div>
        </div>
      
      <SheetContent className="h-full flex z-[999]" side="bottom">
        <VisuallyHidden>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>This is a description of the sheet content.</SheetDescription>
        </VisuallyHidden>
        <ToDoList {...{day, closePopover}}/>
      </SheetContent>
    </Sheet>
  )
}, areEqual);


interface IPropsTodoList {
  day: IDay,
  closePopover: () => void,
}

function ToDoList ({day, closePopover}: IPropsTodoList) {
  const [todoTask , setTodoTask] = useState<['EDIT'|'VIEW', [number, ITodoTask]]>();
  const calendar = useCalendar<MonthStore>(day.month);

  function toRemoveTodoTask(indexTask: number) {
    calendar.removeTaskFromDay(day.day, indexTask);
  }

  return (
    <>
      <div className="ToDoList pt-2">
        <div className="ToDoList__header">
          <H4>День: {`${day.day}`.padStart(2, '0')} </H4> 
        </div>
        <div className="ToDoList__container">
        {
          todoTask && (
            <ResizableBox>
            <div className="ToDoList__task-form ">
                {
                  todoTask && (
                    todoTask[0] === 'EDIT' 
                    ? (
                      <TaskForm {...day} 
                      todoTaskIndex={todoTask[1][0]} 
                      todoTask={todoTask[1][1]} 
                      toClose={closePopover}/>
                    )
                    : todoTask[0] === 'VIEW' && (
                      <ViewerTodoTask {...todoTask[1][1]}/>
                    )
                  )
                } 
            </div>
          </ResizableBox>
          )
        }
         
          <div className="ToDoList__wrapper">
              <div className="ToDoList__task-list">
                {day.tasks.map((item, index) => (
                  <div key={index} className={`ToDoList__task ${ todoTask && todoTask[1][0]  == index ? '__active': ''}`} >
                    <div className="ToDoList__task-header">
                      <H5>{item.title}</H5>
                      <P className="whitespace-pre-wrap text-pretty">{item.description}</P>
                    </div>
                    <div className="ToDoList__footer">
                      {/* <H5>подзадачи: {item.subTasks.length}</H5> */}
                      <div className="ToDoList__footer-wrapper">
                        <Button variant="secondary" onClick={setTodoTask.bind(null, ['VIEW', [index, item]])}><Eye/> посмотреть</Button>
                        <Button variant="secondary" onClick={setTodoTask.bind(null, ['EDIT', [index, item]])}><Pencil/> редактировать</Button>
                        <Button variant="link" onClick={toRemoveTodoTask.bind(null, index)}>удалить</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>   
      </div>
    </>
  )
}


function ViewerTodoTask({title,description, subTasks}:ITodoTask) {
 return (
  <div className="ViewerTodoTask">
    <H4>{title}</H4>
   {
    !!description && (
      <P className="whitespace-pre-wrap text-muted-foreground text-pretty">{description}</P>
    )
   }
   <div>
      {subTasks.map((subTask) => {
        return (
          <div className="flex items-center px-4">
            <P className="text-pretty w-full text-muted-foreground">{subTask.action}</P>
            <Checkbox className="rounded-md disabled:cursor-default size-6" checked={subTask.completed} disabled/>
          </div>
        )
      })}
   </div>
  </div>
 )
}

