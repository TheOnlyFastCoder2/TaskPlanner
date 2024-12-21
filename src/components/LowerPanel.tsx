import 'styles/components/Navigation.scss';
import { IListTaskForSearch, useCalendar } from "@/lib/store/CNCalender";
import { Button } from "./ui/button";
import { Input } from './ui/input';
import { useRef, useState } from 'react';
import { H4, P } from './ui/typography';
import TodoListSaver, { TActions } from './TodoListSaver';

interface IProps {
  setDirection: (direction: -1|1|0) => void,  
}

export default function LowerPanel ({setDirection}:IProps) {
  const calendarStore = useCalendar();
  const refTodoListSaverActions = useRef<TActions>({
    toClose: null, toOpen: null
  }) 

  function setCalendar(direction: -1|1) {
    calendarStore.setCurrMonthByDirection(direction);
    setDirection(direction);
  }

  return (
    <>
      <TodoListSaver actions={refTodoListSaverActions}/>
      <div className="LowerPanel flex gap-4 flex-wrap justify-between">
        <Searcher {...{setDirection}}/>
        <div className="LowerPanel__navigation">
          <Button variant="outline" onMouseUp={setCalendar.bind(null, -1)}>пред. месяц</Button>
          <Button variant="outline" onMouseUp={setCalendar.bind(null, 1)}>след. месяц</Button>
        </div>
        <Button className={'min-lg:ml-auto xl:flex-grow-0 flex-grow'} variant="outline" onClick={refTodoListSaverActions.current?.toOpen!}>
            <strong>сохранить</strong>/<strong>загрузить</strong> todoList
          </Button>
      </div>
    </>
  )
}

function Searcher({ setDirection }:IProps) {
  const calendar = useCalendar();
  const [taskList, setTaskList] = useState<IListTaskForSearch[]>();
  const refResponse = useRef('');

  function toSearch(ev: React.FormEvent<HTMLInputElement>) {
    const sentence = ev.currentTarget.value;
    const list = calendar.toFindTaskBySentence<IListTaskForSearch>(calendar.calendar, sentence);
    refResponse.current = sentence;
    setTaskList(list);
  }
  
  function setCurrMonthByKey(keyMonth: string, year: number, month: number) {
    calendar.setCurrMonthByKey(keyMonth, year, month);
    setDirection(0);
  }

  return (
    <div className="Searcher  relative lg:flex-grow">
      {
         !!taskList?.length && (
            <ul className={'absolute flex  mb-4 bg-background px-4 py-2 shadow-xl shadow-slate-200 rounded-lg flex-col bottom-full gap-2'}>
            {
              taskList.map(({day, keyMonth, year, month, task}) => {
                return (
                  <li  
                  className='flex max-w-[900px] min-md:text-nowrap min-w-min cursor-pointer hover:scale-95 hover:opacity-80 shadow-md shadow-slate-100 transition-transform gap-4 justify-between items-center bg-background px-4 py-2  border-[1px] border-slate-200'
                  key={keyMonth+day} onClick={setCurrMonthByKey.bind(null, keyMonth, year, month)} >
                    <H4>{task.title}</H4>
                    <P className={'text-muted-foreground '}>{day}-{keyMonth}</P>
                  </li>
                )
              })
            }
          </ul>
         )
      }
    
      <Input type="text" onInput={toSearch} placeholder='Найти задачу' value={refResponse.current}/>
    </div>
  ) 
}