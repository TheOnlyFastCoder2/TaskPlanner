import React, { useEffect, useRef, useState } from "react";
import DraggableBox from "./ui/DraggableBox";
import { Popover } from "./ui/MyPopover";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ISaverData, useCalendar } from "@/lib/store/CNCalender";
import { H4 } from "./ui/typography";


export type TActions  = {
  toOpen: (() => void)|null,
  toClose: (() => void)|null,
};

interface IProps {
  actions: React.RefObject<TActions>,
}

export default function ({actions}: IProps) {
  const calendar = useCalendar();
  const [file, setFile] = useState<File>()
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const refStartCoords = useRef({x: innerWidth/2, y: innerHeight/2})
  const toOpen = () => setIsOpen(true);
  const toClose = () => setIsOpen(false);
  
  useEffect(() => {
    actions.current = {
      toClose,toOpen
    }
  }, []);

  function toSaveFileFromText(text: string) {
    const blob = new Blob([text], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toDoList.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function toLoadTodoList(ev:React.ChangeEvent<HTMLInputElement>) {
    if(ev.currentTarget.files) {
      setFile(ev.currentTarget.files[0])
    }
  }

  function toSaveTodoList() {
    const test = calendar.toFindTaskBySentence<ISaverData>(calendar.calendar);
    toSaveFileFromText(JSON.stringify(test));
    setFile(undefined);
  }
  
  useEffect(() => {
    if(file) {
      const fileRead = new FileReader();
      fileRead.onload = (ev) => {
        if(ev.target?.result) {
          calendar.toUploadTodoListFromNewData(
            JSON.parse(ev.target.result as string) as ISaverData[]
          );
          toClose();
          setFile(undefined);
        }
      }
      fileRead.onerror = (e) => {
        console.error("Ошибка при чтении файла:", e);
        setFile(undefined);
      }

      fileRead.readAsText(file);
    }
  }, [file]);

  return  (
    <Popover isOpen={isOpen}>
      <DraggableBox startCoords={refStartCoords} parentIDorClassName="root" toClose={toClose}> 
        <H4 className="text-center py-4">Выберите действия</H4>
        <div className="TodoListSaver min-w-[400px] gap-4  p-10 flex justify-center">
          <Button variant={"outline"}>
            <Label  htmlFor="picture" className={"cursor-pointer"}>Загрузить</Label>
            <Input onChange={toLoadTodoList} id="picture" className={'hidden'} type="file" />
          </Button>
          <Button variant={"outline"} onClick={toSaveTodoList}>
            сохранить
          </Button>
        </div>
      </DraggableBox>
    </Popover>
  )
};