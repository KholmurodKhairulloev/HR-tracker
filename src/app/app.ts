import { CommonModule } from "@angular/common";
import { Component, HostListener } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatMenu, MatMenuModule } from "@angular/material/menu";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MatMenu, MatMenuModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})

export class App {

  weekdaysName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  selectedMonth: number = new Date().getMonth();
  currentYear = new Date().getFullYear()
  selectedYear: number = this.currentYear
  years = Array.from({ length: 7 }, (_, i) => this.currentYear - 3 + i);
  calendarData: { date: number, weekday: string }[] = []
  daysInMonth!: number;


  workers = [
    { id: 1, name: 'Каролина Давис', statusDays: [] as string[] },
    { id: 2, name: 'Давид Вилсон', statusDays: [] as string[] },
    { id: 3, name: 'Емма Браун', statusDays: [] as string[] },
    { id: 4, name: 'Алексей Иванов', statusDays: [] as string[] },
    { id: 5, name: 'Мария Смирнова', statusDays: [] as string[] }
  ]

  dayType = [
    { id: 10, key: "P", name: "Present" },
    { id: 11, key: "V", name: "Vacation" },
    { id: 12, key: "A", name: "Absent" },
    { id: 13, key: "L", name: "Late" },
  ]



  generateCalendar() {
    this.daysInMonth = new Date(Number(this.selectedYear), Number(this.selectedMonth) + 1, 0).getDate();
    this.calendarData = [];

    // Для каждого сотрудника создаем массив статусов
    this.workers.forEach(worker => {
      worker.statusDays = new Array(this.daysInMonth).fill(null);
    });

    for (let day = 1; day <= this.daysInMonth; day++) {
      const dayIndex = new Date(this.selectedYear, this.selectedMonth, day).getDay();
      this.calendarData.push({
        date: day,
        weekday: this.weekdaysName[dayIndex]
      });
    }
  }

  ngOnInit() {
    this.generateCalendar();
    console.log(this.workers);  
  }

   /* for multiselect */

  // Это массив для хранения всех выделенных ячеек
  selectedCells: { workerId: number, dayIndex: number }[] = [];
  // Флаг, который показывает, зажата ли кнопка мыши (происходит ли "перетаскивание")
  isDragging = false;
  // Координаты первой ячейки, с которой началось выделение
  startCell: { workerId: number, dayIndex: number } | null = null;
  // Координаты последней ячейки, до которой довели курсор
  endCell: { workerId: number, dayIndex: number } | null = null;


  isMenuOpen = false;



// Этот метод меняет статус. Теперь он работает и для одной, и для нескольких ячеек
onDayStatusSelect(worker: any, dayIndex: number, key: string): void {
  // Проверяем, есть ли что-то в массиве выделенных ячеек
  if (this.selectedCells.length > 0) {
    // Если есть, то проходим по каждой выделенной ячейке...
    this.selectedCells.forEach(cell => {
      const selectedWorker = this.workers.find(w => w.id === cell.workerId);
      if (selectedWorker) {
        // ...и меняем её статус
        selectedWorker.statusDays[cell.dayIndex] = key;
      }
    });
    // Выводим сообщение и очищаем выделение
    console.log(`Статус для ${this.selectedCells.length} ячеек обновлен на: ${key}`);
    this.selectedCells = [];
  } else {
    // Если выделенных ячеек нет, то просто меняем статус одной ячейки, как раньше
    worker.statusDays[dayIndex] = key;
    console.log(`Статус для сотрудника ${worker.name} на день ${dayIndex + 1} обновлен на: ${key}`);
  }
}



  // Эта функция срабатывает, когда ты нажимаешь кнопку мыши
onMouseDown(event: MouseEvent, workerId: number, dayIndex: number): void {

   if (this.isMenuOpen) {
    return;
  }

  // Начинаем "перетаскивание"
  this.isDragging = true;
  // Очищаем предыдущее выделение
  this.selectedCells = [];
  // Запоминаем, где мы начали
  this.startCell = { workerId, dayIndex };
  this.endCell = null;
  // Добавляем начальную ячейку в список выделенных
  this.selectedCells.push({ workerId, dayIndex });
}

// Эта функция срабатывает, когда ты двигаешь мышь над ячейкой (с зажатой кнопкой)
onMouseEnter(event: MouseEvent, workerId: number, dayIndex: number): void {

   if (this.isMenuOpen) {
    return;
  }
  
  // Проверяем, что кнопка мыши зажата
  if (this.isDragging) {
    // Запоминаем текущую ячейку как конечную точку
    this.endCell = { workerId, dayIndex };
    // Обновляем список всех ячеек в выделенном прямоугольнике
    this.updateSelectedCells();
  }
}

// Эта функция срабатывает, когда ты отпускаешь кнопку мыши в любом месте страницы
@HostListener('document:mouseup', ['$event'])
onMouseUp(event: MouseEvent): void {
  // Завершаем "перетаскивание"
  this.isDragging = false;
}

// Эта функция обновляет массив selectedCells,
// включая все ячейки между startCell и endCell
updateSelectedCells(): void {
  if (!this.startCell || !this.endCell) {
    return;
  }

  // Находим индексы сотрудников (строк) и дней (колонок)
  const startWorkerIndex = this.workers.findIndex(w => w.id === this.startCell!.workerId);
  const endWorkerIndex = this.workers.findIndex(w => w.id === this.endCell!.workerId);

  const startRow = Math.min(startWorkerIndex, endWorkerIndex);
  const endRow = Math.max(startWorkerIndex, endWorkerIndex);
  const startCol = Math.min(this.startCell!.dayIndex, this.endCell!.dayIndex);
  const endCol = Math.max(this.startCell!.dayIndex, this.endCell!.dayIndex);

  // Очищаем старое выделение
  this.selectedCells = [];

  // Заполняем массив selectedCells всеми ячейками в прямоугольнике
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      this.selectedCells.push({ workerId: this.workers[r].id, dayIndex: c });
    }
  }
}

// Возвращает true, если ячейка есть в массиве selectedCells
isSelected(workerId: number, dayIndex: number): boolean {
  return this.selectedCells.some(cell => cell.workerId === workerId && cell.dayIndex === dayIndex);
}





}

