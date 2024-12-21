import { useState } from "react";
import { useCalendar, IDay, ITodoTask, MonthStore, ITodoSubTask } from "@/lib/store/CNCalender";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { H4, P } from '@/components/ui/typography';
import { Checkbox } from "../ui/checkbox";
import { Pencil } from "lucide-react";


interface IProps extends IDay {
  toClose: () => void;
  todoTask?: ITodoTask,
  todoTaskIndex?: number,
} 

interface ITodoTaskCopy  extends ITodoTask {
  create?: boolean
}

export default function TaskForm ({day, month, year, toClose, todoTask, todoTaskIndex}: IProps) {
  const calendar = useCalendar<MonthStore>(month);
  const [todoTaskCopy, setTodoTask] = useState(todoTask??(
    {
      title: '',
      description: '',
      subTasks: [],
      create: false,
    } as ITodoTaskCopy
  ));

  function toReloadTodoTaskCopy(todoTask: ITodoTask) {
    setTodoTask({...todoTask})
  }


  function handleTitle(ev:React.FormEvent<HTMLInputElement>) {
    const {value} = ev.currentTarget;
    setTodoTask((prev) => ({
      ...prev,
      title:value,
    }));
  }
  

  function handleDescription(ev:React.FormEvent<HTMLTextAreaElement>) {
    const {value} = ev.currentTarget;
    setTodoTask((prev) => ({
      ...prev,
      description: value,
    }));
  }

  function saveTask() {
    if(todoTaskCopy.title) {
      calendar.addTaskToDay(day, day, todoTaskCopy);
      toClose();
    }
  }
  
  function editTask () {
    if(todoTaskCopy.title && todoTaskIndex !== undefined) {
      calendar.editTaskToDay(day, todoTaskIndex, todoTaskCopy);
    }
  }

  function createSubTask() {
    todoTaskCopy.subTasks.push({
      action: '',
      edit: true,
      completed: false,
    });
    toReloadTodoTaskCopy(todoTaskCopy);
  }

  function toCancel () {
    toClose();
  }
  
  return (
    <div className="task-form p-2">
      <div className="flex flex-wrap gap-x-2 gap-y-4 w-full">
        <div className="flex-grow flex flex-col gap-4 select-none ">
          <div className="task-form__header">
            <H4>{!todoTask ? "Создать задачу" : "Редактировать"}</H4>
            <P>
              дата: {`${day}`.padStart(2, '0')}:{`${month}`.padStart(2, '0')}:{`${year}`.padStart(2, '0')}
            </P>
          </div>
          
          <div className="task-form__input-group">
            <div className="input-group">
              <Label htmlFor="title" className="input-group__label">Title</Label>
              <Input autoComplete="off" required onInput={handleTitle} value={todoTaskCopy.title}   id="title"  className="input-group__input" />
            </div>
            <div className="input-group">
              <Label htmlFor="description" className="input-group__label">description</Label>
              <Textarea  required onInput={handleDescription} value={todoTaskCopy.description}   id="description" className="input-group__input  whitespace-pre-wrap" />
            </div>
          </div>
          <div className="task-form__buttons">
            <Button onClick={todoTask?editTask:saveTask}>сохранить</Button>
            {!todoTask && (
              <Button onClick={toCancel}>отмена</Button>
            )}
          </div>
        </div>
  
        <div className="task-form-sub-task">
          <Button variant="outline" onClick={createSubTask}>Создать задачу</Button>
          <div className="flex flex-col gap-2 max-h-[500px] flex-grow overflow-y-auto">
            {todoTaskCopy.subTasks.map((subTask, subTaskIndex) => {
              return (
                subTask.edit
                ? <SubTaskEdit key={subTaskIndex}  {...{toReloadTodoTaskCopy, todoTaskCopy, subTask, subTaskIndex}}/>
                : <SubTask key={subTaskIndex} {...{toReloadTodoTaskCopy, todoTaskCopy, subTask, subTaskIndex}}/>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface IPropsSubTask {
  todoTaskCopy: ITodoTaskCopy,
  subTask: ITodoSubTask,
  subTaskIndex: number,
  toReloadTodoTaskCopy: (todoTask: ITodoTask) => void
}

export function SubTask({subTask, todoTaskCopy, subTaskIndex, toReloadTodoTaskCopy}:IPropsSubTask) {

  function toTargetCompleted() {
    const subTaskCopy = todoTaskCopy.subTasks[subTaskIndex];
    subTaskCopy.completed = !subTaskCopy.completed;
    toReloadTodoTaskCopy(todoTaskCopy);
  }
  
  function toEdit() {
    todoTaskCopy.subTasks[subTaskIndex].edit = true;
    toReloadTodoTaskCopy(todoTaskCopy);
  }

  return (
    <div className="flex h-min gap-2 px-4 py-2">
      <P className="w-full text-muted-foreground text-pretty">
        {subTask.action}
      </P>
      <Button className="size-6" onClick={toEdit}><Pencil/></Button>
      <Checkbox id="subTask"  className={"size-6 rounded-md"} onClick={toTargetCompleted} checked={subTask.completed}/>
    </div>
  )
}


export function SubTaskEdit({subTask, todoTaskCopy, subTaskIndex, toReloadTodoTaskCopy}: IPropsSubTask) {
  const [text, setAction] = useState<string>(subTask.action||'');
  
  function handleInputTextArea(ev:React.FormEvent<HTMLTextAreaElement>) {
    setAction(ev.currentTarget.value);
  }

  function toSaveAction () {
    if(todoTaskCopy.create) {
      todoTaskCopy.create = true;
    }

    todoTaskCopy.subTasks[subTaskIndex].action = text;
    todoTaskCopy.subTasks[subTaskIndex].edit = false;
    toReloadTodoTaskCopy(todoTaskCopy);
  }

  function toCancel() {
    if(!todoTaskCopy.subTasks[subTaskIndex].action) {
      todoTaskCopy.subTasks.splice(subTaskIndex);
    }
 
    toReloadTodoTaskCopy(todoTaskCopy);
    todoTaskCopy.subTasks[subTaskIndex].edit = false;
  }

  return (
    <div>
      <div className="px-4 py-2">
        <Textarea  required onInput={handleInputTextArea} value={text} className="whitespace-pre-wrap" />
        <div className="mt-2 flex gap-2 justify-end">
          <Button onClick={toSaveAction}>Сохранить</Button>
          <Button onClick={toCancel}>Отмена</Button>
        </div>
      </div>
    </div>
  )
}