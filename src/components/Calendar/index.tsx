import 'styles/components/Calendar.scss';
import { memo, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite'
import { MonthStore, useCalendar } from "@/lib/store/CNCalender";
import { H3, H6} from '@/components/ui/typography';
import NavigationOfCalendar from '@/components/LowerPanel';
import Day from './Day';


const Calendar = observer(() => {
  const refDirection = useRef(0);
  const refCurrMonth = useRef<MonthStore>(null)
  const calendarStore = useCalendar();
  const calendars = Array.from(calendarStore.calendar).sort(([__1, a], [__2, b]) => {
    return b.year !== a.year ? a.year - b.year : a.month - b.month;
  });


  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth()+1;

    calendarStore.addMonth(new MonthStore(year, month));
    calendarStore.setCurrMonthByKey(`${month}-${year}`, year, month);
    
  }, []);

  function setDirection(direction: -1 | 1 | 0) {
    refDirection.current = direction;
  }

  useEffect(() => {
    refCurrMonth.current = calendarStore.calendar.get(calendarStore.currMonthKey)!;
  }, [calendarStore.currMonthKey]);

  return (
    <>
      <div className='Calendars'>
        {
          calendars.map(([id, item]) => {
            let currMonthName:string|undefined;
            let currYear:number|undefined;
            let prevMonthKey:string|undefined;
            let nextMonthKey:string|undefined; 

            const isCurrentMonth = item.keyMonth === calendarStore.currMonthKey ? '__current' : '';
            const isNextOrPrev = refDirection.current === 0 ? '__frontal' : refDirection.current === -1 ? '__left' :  '__right';
           
            if(refCurrMonth.current) {
              const data = calendarStore.toFormatDate(refCurrMonth.current);
              nextMonthKey = data.nextMonthKey;
              prevMonthKey = data.prevMonthKey;
            }
            
            const shouldRenderCurrent = id === calendarStore.currMonthKey;
            const shouldRenderAdjacent = refDirection.current !== -1 ? prevMonthKey : nextMonthKey;
            const isSecond = shouldRenderAdjacent === id ? '__second': '';

            if(shouldRenderCurrent) {
              currYear = item.year;
              currMonthName = item.monthName;
            }
            
            return (shouldRenderCurrent || shouldRenderAdjacent === id) && (
              <div className={`Calendar ${isCurrentMonth} ${isNextOrPrev} ${isSecond}`} key={id}>
                <CalendarHeader monthName={currMonthName||''} year={currYear||""} />
                <div className="Calendar__days-numbers">
                  {item.days.map((entityDay, i) => {
                    const dayName = calendarStore.daysNames[i % calendarStore.daysNames.length]
                    return (
                      <Day 
                        key={entityDay.id}
                        day={entityDay}
                        dayName={dayName}
                        isNextMonth={entityDay.keyMonth !== item.keyMonth}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })
        }
       
      </div>
      <NavigationOfCalendar  setDirection={setDirection}/>
    </>
  );
})

export default Calendar;

const CalendarHeader = memo(({ monthName, year }:{monthName:string, year: number|string}) => (
  <div className="wrapper-sticky">
    <H3 className="Calendar-month">{monthName}</H3>
    <H6 className="Calendar-year">{year}</H6>
  </div>
));
