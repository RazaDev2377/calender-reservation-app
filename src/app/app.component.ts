import { Component } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'calender-reservation';
  currentYear = new Date().getFullYear();
  currentDate = new Date();
  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weeks: any[] = [];
  reservedArray: any[] = [];
  monthStart: any;
  monthEnd: any;
  currentTenantName: any = "";
  selectedDate: any = new Date().toDateString();;
  currentStay: any = null;
  showDetails: any = false;

  getNextMonth(date: Date) {
    const nextMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.currentDate = nextMonth;
    this.updateCalender(nextMonth);
  }

  getPrevMonth(date: Date) {
    const prevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.currentDate = prevMonth;
    this.updateCalender(prevMonth);
  }
  bindTenantName(event: any){
    this.currentTenantName = event.target.value;
    
  }

  updateCalender(date: Date) {
    const weeks = [];
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const numDays = monthEnd.getDate();
    let dayOfWeek = monthStart.getDay();
    this.monthStart = monthStart;
    this.monthEnd = monthEnd;
    let dateNum = 1;
    while (dateNum <= numDays) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        if (dateNum > numDays) {
          break;
        }
        if (i >= dayOfWeek) {
          week.push({ date: dateNum, completeDate: new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${dateNum}`) });
          dateNum++;
        } else {
          week.push(null);
        }
      }
      weeks.push(week);
      dayOfWeek = 0;
    }
    this.weeks = weeks;
    this.getReservedSlotList(monthStart, monthEnd);
    this.showDetails=  false;
  }

  ngOnInit(): void {
    this.updateCalender(new Date);
  }

  getReservedSlotList(startTimestamp: any, endTimestamp: any) {

    startTimestamp = Math.floor(startTimestamp.getTime() / 1000);
    endTimestamp = Math.floor(endTimestamp.getTime() / 1000);

    axios.get(`http://localhost:3000/reserve/${startTimestamp}/${endTimestamp}`)
      .then(response => {
        if (response.data && response.data.reserved) {
          let list = response.data.reserved;

          const updatedList = list.map(function (reserve: any) {
            reserve.date = new Date((reserve.time * 1000)).toLocaleString();
            reserve.dateFormatted = new Date(reserve.date).toDateString();
            return reserve;
          });
          this.reservedArray = updatedList;
          this.currentTenantName=  null;
          this.currentStay=  null;
        

        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  confirmStay(date: any) {

    if(this.currentTenantName == null){
      alert("Enter tenant name");
    }
    else{

    date = new Date(date);
    date.setDate(date.getDate() + 1);
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    let _this = this;
    axios.post('http://localhost:3000/reserve', { tennantName: this.currentTenantName, reserved: true, "time": unixTimestamp, })
      .then(response => {
        console.log(response);
        _this.getReservedSlotList(_this.monthStart, _this.monthEnd);
        alert("Stay Confirmed");
        _this.showDetails=  false;
      })
      .catch(error => {
        console.error(error);
      });
    }

  }

  cancelStay(date: any) {
    date = new Date(date);
    date.setDate(date.getDate() + 1);
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    let _this = this;
    axios.post('http://localhost:3000/reserve', { tennantName: this.currentTenantName, reserved: false, "time": unixTimestamp, })
      .then(response => {
        _this.getReservedSlotList(_this.monthStart, _this.monthEnd);
        alert("Stay Cancelled");
        _this.showDetails=  false;
      })
      .catch(error => {
        console.error(error);
      });
  }

  checkStays(date: any) {
    this.selectedDate = date.toDateString();
  date = new Date(date);

    let stayList = this.reservedArray;
    const stayFound = stayList.find(function (reserve) {
      let reserveDate = new Date(reserve.date);
      // console.log(date.getDate(), reserveDate.getDate())
      if (date.getFullYear() == reserveDate.getFullYear() && date.getMonth() == reserveDate.getMonth() && date.getDate() == reserveDate.getDate())
        return reserve;
    });

    this.currentStay = stayFound ? stayFound : null;
    this.showDetails=  true;

  }

}
