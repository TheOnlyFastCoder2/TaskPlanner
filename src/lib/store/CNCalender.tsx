import { makeAutoObservable, runInAction } from 'mobx';
import React, { createContext, useContext, ReactNode } from 'react';
import getDaysFromDate from '@/lib/getDaysFromDate';

export interface ITodoSubTask {
  action: string,
  completed: boolean,
  edit: boolean,
}

export interface ITodoTask {
  title: string;
  description?: string;
  subTasks: ITodoSubTask[]
}

export interface IDay {
  id: string,
  day: number;
  month: number;
  year: number;
  keyMonth: string,
  tasks: ITodoTask[];
}

export interface IDragDay {
  day: IDay | undefined;
  task: ITodoTask | undefined;
}

export interface IListTaskForSearch {
  keyMonth: string; 
  day: number; 
  task: ITodoTask;
  month: number, 
  year: number, 
}

export interface ISaverData extends IListTaskForSearch  {
  currMonthKey: string,
  prevMonthAndYear: number;
  currMonth: number;
  currYear: number;
}

export class MonthStore {
  year: number;
  month: number;
  days: IDay[];
  keyMonth: string;
  refDayAndTask: IDragDay;

  constructor(year:number, month:number) {
    this.days = [];
    this.year = year;
    this.month = month;
    this.keyMonth = `${month}-${year}`;
    this.refDayAndTask = {
      day: undefined,
      task: undefined,
    };
    makeAutoObservable(this);
    this.createDays();
  }

  get monthName() {
    const monthNames = [
      "январь", "февраль", "март", "апрель", "май", "июнь",
      "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
    ];

    return monthNames[this.month-1];
  }
  
  createDays() {
    const qtyDays = getDaysFromDate(this.year, this.month);
    this.days = Array.from({ length: qtyDays }).map((_, index) => ({
      id: `${index + 1}-${this.keyMonth}`,
      tasks: [],
      day: index + 1,
      year: this.year,
      month: this.month,
      keyMonth: this.keyMonth
    }));
  }


  addTaskToDay(prevDayIndex: number, dayIndex: number, newTask: ITodoTask) {
    dayIndex -= 1;
    prevDayIndex -= 1;
    this.days[prevDayIndex] = { ...this.days[prevDayIndex] };
    this.days[dayIndex] = {
      ...this.days[dayIndex],
      tasks: [newTask, ...this.days[dayIndex].tasks],
    };
  }
  
  removeTaskFromDay(dayIndex: number, taskIndex: number) {
    dayIndex -= 1;
    this.days[dayIndex].tasks.splice(taskIndex, 1);
    this.days[dayIndex] = {...this.days[dayIndex]};
  }

  addSubTask (dayIndex: number, todoTaskIndex: number, todoSubTask: ITodoSubTask) {
    dayIndex -= 1;
    this.days[dayIndex].tasks[todoTaskIndex].subTasks.push(todoSubTask);
    this.days[dayIndex] = {...this.days[dayIndex]};
  }

  removeSubTask(dayIndex: number, todoTaskIndex: number, todoSubTaskIndex:number,) {
    dayIndex -= 1;
    const item = this.days[dayIndex].tasks[todoTaskIndex].subTasks.splice(todoSubTaskIndex, 1);
    if(item) {
      this.days[dayIndex] = {...this.days[dayIndex]};
    }
  }

  editSubTaskToDay(dayIndex: number, todoTaskIndex: number, todoSubTaskIndex:number, todoSubTask: ITodoSubTask) {
    dayIndex -= 1;
    const day = this.days[dayIndex];
    day.tasks[todoTaskIndex].subTasks[todoSubTaskIndex] = todoSubTask;
    this.days[dayIndex] = {
      ...day,
      tasks: [...day.tasks]
    }
  }

  editTaskToDay(dayIndex:number, todoTaskIndex:number, editedTodoTask:ITodoTask) {
    dayIndex -= 1;
    const day = this.days[dayIndex];
    day.tasks[todoTaskIndex] = editedTodoTask;
    this.days[dayIndex] = {
      ...day,
      tasks: [...day.tasks]
    }
  }
}


class CalendarStore {
  calendar: Map<string, MonthStore>;
  prevMonthAndYear: number = 0;
  currMonth: number = 0;
  currYear: number = 0;
  currMonthKey: string = '';
  daysNames = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'] as const;

  constructor () {
    this.calendar = new Map();
    makeAutoObservable(this);
  }

  setCurrMonthByKey(key: string, year:number, month: number) {
    this.currMonthKey = key;
    this.currYear = year;
    this.currMonth = month;
    this.prevMonthAndYear = 0;
  }

  toFindTaskBySentence <T = IListTaskForSearch|ISaverData>(calendar: Map<string, MonthStore>, sentence?: string): T[] {
    return Array.from(calendar.values()).flatMap(monthStore =>
      monthStore.days.flatMap(day =>
        day.tasks.reduce((acc, task) => {
          if(sentence) {
            const test = new RegExp(sentence, "g").test(task.title);
            if(test && sentence.length > 0) {
              acc.push(
                {
                  month: monthStore.month,
                  year: monthStore.year,
                  keyMonth: monthStore.keyMonth,
                  day: day.day,
                  task: task,
                } as T
              );
            }
          } else {
            
            acc.push(
              {
                prevMonthAndYear: this.prevMonthAndYear,
                currMonth: this.currMonth,
                currYear: this.currYear,
                currMonthKey: this.currMonthKey,
                keyMonth: monthStore.keyMonth,
                month: monthStore.month,
                year: monthStore.year,
                day: day.day,
                task: task,
              } as T
            ); 
          }
           return acc;
        }, [] as T[])
      )
    );
  }
  
  toUploadTodoListFromNewData(data: ISaverData[]) {
    const calendar = new Map<string, MonthStore>();
    const setTaskForMonth = (monthStore:MonthStore, item: ISaverData) => {
      monthStore.days.forEach((entityDay) => {
        if(entityDay.day === item.day) {
          monthStore.addTaskToDay(item.day, item.day, item.task);
        }
      });
    }

    for(const item of data) {
      if(!calendar.has(item.keyMonth)) {
        const monthStore = new MonthStore(item.year, item.month);
        setTaskForMonth(monthStore, item);
        calendar.set(item.keyMonth, monthStore)
      } else {
        const monthStore = calendar.get(item.keyMonth)!;
        setTaskForMonth(monthStore, item);
      }
    }

    runInAction(() => {
      this.calendar = calendar;
      this.currMonth = data[0].currMonth;
      this.currYear = data[0].currYear;
      this.currMonthKey = data[0].currMonthKey;
      this.prevMonthAndYear = data[0].prevMonthAndYear;
    });
  }

  setCurrMonthByDirection(direction: 1|-1) {
     this.getPrevOrNextMonth(direction);
    
     this.currMonthKey = `${this.currMonth}-${this.currYear}`;
     const entityMonth = this.calendar.get(this.currMonthKey);

     if (!entityMonth) {
         this.addMonth(new MonthStore(this.currYear, this.currMonth));
     } else {
      const {nextEntityMonth, prevEntityMonth} = this.getNextAndPrevMonth(entityMonth);
      !nextEntityMonth && this.addMonth(
        new MonthStore(this.currYear, this.currMonth)
      );
      !prevEntityMonth && this.addMonth(
        new MonthStore(this.currYear, this.currMonth)
      );
     }
  }

  getPrevOrNextMonth(direction: -1 | 1) {
    this.currMonth += direction;
    if (this.currMonth > 12) {
      this.currMonth = 1;
      this.currYear += 1;
    } else if (this.currMonth < 1) {
        this.currMonth = 12;
        this.currYear -= 1;
    }
  }

  toFormatDate (entityMonth: MonthStore) {
    const isNextYear = (entityMonth.month + 1) > 12 ? 1 : 0; 
    const nextYear = entityMonth.year + isNextYear;
    const nextMonth = (entityMonth.month+1)%12;

    const isPreviousYear = (entityMonth.month - 1) < 1 ? 1 : 0; 
    const prevYear = entityMonth.year - isPreviousYear;
    const prevMonth = (entityMonth.month - 1 + 12) % 12 || 12;

    return {
      nextYear, nextMonth,
      prevYear, prevMonth,
      prevMonthKey: `${prevMonth}-${prevYear}`,
      nextMonthKey: `${nextMonth}-${nextYear}`
    };
  }

  getNextAndPrevMonth(entityMonth:  MonthStore) {
    const formattedDate = this.toFormatDate(entityMonth);
    return {
      ...formattedDate,
      nextEntityMonth: this.calendar.get(formattedDate.nextMonthKey),
      prevEntityMonth: this.calendar.get(formattedDate.prevMonthKey),
    };
  }

  getDaysFromNextMonth(entityMonth: MonthStore, nextEntityMonth: MonthStore) {
    if(entityMonth.days.length % 7 !== 0) {
      entityMonth.days = [
        ...entityMonth.days,
        ...nextEntityMonth.days.filter((_, i) => (
          entityMonth.days.length+i < 35 
        ))
      ];
    }
  }
  
  addMonth(entityMonth: MonthStore) {
    this.currYear = entityMonth.year;
    this.currMonth = entityMonth.month;
    this.currMonthKey = `${entityMonth.month}-${entityMonth.year}`;
    const months = this.getNextAndPrevMonth(entityMonth);
    const { nextEntityMonth, nextYear, nextMonth, nextMonthKey } = months;
    const { prevEntityMonth, prevYear, prevMonth, prevMonthKey } = months;

    runInAction(() => {
        this.calendar.set(this.currMonthKey, entityMonth);
    });

    runInAction(() => {
      this.processMonth(entityMonth, nextEntityMonth, nextYear, nextMonth, nextMonthKey);
    });
  
    this.processMonth(entityMonth, prevEntityMonth, prevYear, prevMonth, prevMonthKey);
    
}

  processMonth(entityMonth: MonthStore, entityMonthStore: MonthStore | undefined, year: number, month: number, monthKey: string) {
    if (!entityMonthStore) {
        const newMonthStore = new MonthStore(year, month);
        this.getDaysFromNextMonth(entityMonth, newMonthStore);
        runInAction(() => {
            this.getDaysFromNextMonth(entityMonth, newMonthStore);
        });
        this.calendar.set(monthKey, newMonthStore);
    } else if(entityMonthStore) {
        this.getDaysFromNextMonth(entityMonth, entityMonthStore);
    }
  }

  getMonth (id: number) {
    return this.calendar.get(`${id}-${this.currYear}`);
  }
} 

export type TCalendarContext = CalendarStore;
const CalendarContext = createContext<TCalendarContext | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = new CalendarStore();
  return (
    <CalendarContext.Provider value={store}>
      {children}
    </CalendarContext.Provider>
  );
};

export function useCalendar <T = TCalendarContext>(id?:number): T{
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return id ? context.getMonth(id) as T : context as T;
};
