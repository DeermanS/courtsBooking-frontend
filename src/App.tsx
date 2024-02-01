import React, { useEffect, useState, ReactNode} from 'react';
import logoNoBackground from './logo-no-background.png';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './App.css';
import { getAllCourts } from './utils/fetchData';
import { dividerClasses } from '@mui/material';

// TODO1 (Jan 10): 
// 1. Sample data 3 (read current time, add on id) (Check)
// 2. Current players (Check) 
// 3. Editor mode 
// 4. Admin mode

//TODO2 (Jan 11):
// Every user have a fee status to each court:
// 1. Sample data (Check)
// 2. Player可以看到playerid = 1 的fee status 
// 3. Organizer可以看到courtId = 2所有人的fee status
// 4. Admin可以看到所有场所有人的fee status

// TODO3 (Jan 12):
// 1. debug - 添加countCourtId (Check)
// 2. 把user name按竖的list排列，在图像的右边 (Check)
// 3. 在name旁边显示 fee status (check)
// 3.5 把大的compoent拆分成不同功能的component 每个功能尽可能单一
//    - 拆分 create court 方程 （？？？)
// 创建Class
// 3.6 organizer有一个button可以显示所有unpaid name切换显示 所有name
// 
// 4. 整合 getViewDependOnUserLevel 
// 5. login功能
// 6. 用户注册和修改信息
// 7. 用户加入court功能
// 8. 设计界面
// 9. 对接后端

// TODO4 (Jan 20):
// Remove court
// Remove User from userList
// Login Form

enum UserLevel {
  participant = "participant",
  organizer = "organizer",
  admin = "admin",
}

interface Court {
  courtId: number,
  time: string,
  location: string,
  fee: string,
  image: string,
  courtInfo?: CourtInfo,
}

interface PlayerList {
  courtId: number,
  playerList: {
    playerId: number,
    playerName: string,
  }[],
}

interface CourtInfo {
  playerLimit: number,
  shoesRequirment: boolean,
  address: string,
}

enum Status {
  paid = "paid",
  unpaid = "unpaid"
}

interface FeeStatus{
  playerId: number,
  courtId: number,
  status: Status,
}

// Sample courts data
const sampleCourtsData = [
  {
    // Sample data 1
    courtId: 1,
    time: "2024/01/9 18:00-20:00",
    location: "Clearone No.5 Road",
    fee: "$15",
    image: "https://lh5.googleusercontent.com/p/AF1QipOirtLouebsSb1-SQ7yFpA344DvcwKqYDzQ1aBW=s773-k-no",
  },
  {
    //Sample data 2
    courtId: 2,
    time: "2024/01/9 20:00-22:00",
    location: "Clearone No.3 Road",
    fee: "$15",
    image:"https://lh5.googleusercontent.com/p/AF1QipOGJRVrpya-5nAFSVSfEyTXBIvudUt4YpDuGmh4=w203-h152-k-no",
  }
]

// Sample player data
const samplePlayerListData = [
  {
    // Sample player Data 1
    courtId: 1,
    playerList: [
      {
        playerId: 1,
        playerName: "Name1",
      },
      {
        playerId: 2,
        playerName: "Name2",
      },
    ]
  },
  {
    // Sample player data 2
    courtId: 2,
    playerList: [
      {
        playerId: 3,
        playerName: "Name3",
      },
      {
        playerId: 4,
        playerName: "Name4",
      },
    ]
  }
]

// Sample fee status data
const sampleFeeStatusData = [
  {
    playerId: 1,
    courtId: 1,
    status: Status.paid,
  },
  {
    playerId: 2,
    courtId: 1,
    status: Status.unpaid,
  },
  {
    playerId: 3,
    courtId: 2,
    status: Status.unpaid,
  },
]

class User {
  userName: string;
  id: number;
  constructor(name: string, id: number) {
    this.userName = name;
    this.id = id;
  }
  getUserName(){
    return this.userName
  }
  getUserId(){
    return this.id
  }
}

// function removeCourt(courts: Court, setCourts: React.Dispatch<React.SetStateAction<Court>>, courtToRemove: Court) {
//   setCourts(prevCourts => prevCourts.filter(court => court.courtId !== courtToRemove.courtId));
// }

// Component userItem
// TODO4: 重写完之后开始：增加一个缴费功能：每一个用户边上有一个按钮 一按feeState显示Paid 如果已经paid切换成unpaid
function UserItem(props:{userName:string, feeStatus?:FeeStatus}) {
  return(
    <div>
          <span>{props.userName}</span>
          <span>{props.feeStatus ? props.feeStatus.status:""}</span>
    </div>   
  );
}

// Component user list
function  UserList(props:{playerList:PlayerList, courtId:number, feeStatus?:FeeStatus[], userIdCanView?:number, organizerCanView?:number, adminCanView?:number}) {
  const listToRender:ReactNode[] = [];
  props.playerList.playerList.map(player => {
    const userName = player.playerName;
    let feeStatusForPlayer
    const userCanView = player.playerId
    if (userCanView === 1 && !props.organizerCanView && !props.adminCanView) {
      feeStatusForPlayer = props.feeStatus?.filter((selectedFeeStatus) => selectedFeeStatus.playerId === player.playerId)[0];
    }
    else if (props.organizerCanView === 2 && !props.adminCanView) {
      feeStatusForPlayer = props.feeStatus?.filter((selectedFeeStatus) => selectedFeeStatus.courtId === props.organizerCanView)[0];
    }
    else if (props.adminCanView === 1 && props.feeStatus) {
      feeStatusForPlayer = props.feeStatus[0];
    }
    else {
      feeStatusForPlayer = undefined
    }
    const newItem = <UserItem userName = {userName} feeStatus={feeStatusForPlayer}/>
    listToRender.push(newItem);
  })
  return (
    <div>
      {listToRender.map(item => item)}
      <button className="editButton">Edit</button>
    </div>
  )
}

function CourtInfoDetailItem(props:{image: string, time: string, location: string, fee: string, currentUserLevel: UserLevel, playerListForCourt?: PlayerList, feeStatusForCourt: FeeStatus[]}){
  return (
    <div className='courtInfo'>
      <div className='courtDetail'>
        <img src={props.image} alt='court_img'/>
        <label>Time: {props.time}</label>
        <label>Location: {props.location}</label>
        <label>Fee: {props.fee}</label>                  
      </div>
      <GetViewDependOnUserLevel currentUserLevel={props.currentUserLevel} playerListForCourt={props.playerListForCourt} feeStatusForCourt={props.feeStatusForCourt}/>
    </div>
  );
}

function ParticipantView (props:{playerListForCourt: PlayerList, feeStatusForCourt?: FeeStatus[]}) {
  // 找到对应的playerId
  let userCanView: number | undefined;
  // 这里的 1 对应用户的userId
  const user = props.playerListForCourt.playerList.find((player) => player.playerId === 1);
  userCanView = user?.playerId;
  //展示对应playerId能看到的界面
  return(
    props.playerListForCourt ?
      <UserList playerList={props.playerListForCourt} 
        courtId={props.playerListForCourt.courtId}
        feeStatus={props.feeStatusForCourt} 
        userIdCanView = {userCanView}/>
      : <div>No player!!!</div>
  );
}

function OrganizerView (props:{playerListForCourt: PlayerList, feeStatusForCourt?: FeeStatus[]}) {
  let organizerCanView: number;
  let userCanView = undefined;
  const organizerForCurrentCourt = props.playerListForCourt.courtId;
  organizerCanView = organizerForCurrentCourt;
  return( 
    props.playerListForCourt ? (
      <>
        <UserList playerList={props.playerListForCourt} 
          courtId={props.playerListForCourt.courtId}
          feeStatus={props.feeStatusForCourt}
          organizerCanView = {organizerCanView} />
        <div>
          
        </div>
      </> 
    ) : (
      <div>No player!!!</div>
    )
  );
}

function AdminView (props:{playerListForCourt: PlayerList, feeStatusForCourt?: FeeStatus[]}) {
  const adminCanView = 1;
  return(
    props.playerListForCourt ? (
      <>
        <UserList playerList={props.playerListForCourt} 
          courtId={props.playerListForCourt.courtId}
          feeStatus={props.feeStatusForCourt}
          adminCanView = {adminCanView} />
      </> 
    ) : (
      <div>No player!!!</div>
    )
  );
}

function ShowCurrentCourtInfo(props:{courts: Court[]|undefined, currentUserLevel: any, allPlayerLists: PlayerList[], feeStatus: FeeStatus[]}) {
  if (props.courts?.length === 0) {
    return <div>No Courts!!!</div>;
  }
  const courtToRender:ReactNode[] = [];
  props.courts?.map(currentCourt => {
    // Select only required player list
    // Loop player list and select courtId == court id
    const playerListForCourt = props.allPlayerLists.find((currentPlayerList) => currentPlayerList.courtId === currentCourt.courtId);
    // Filter feestatus based on playerId and CourtId
    const feeStatusForCourt = props.feeStatus.filter((selectedFeeStatus) => selectedFeeStatus.courtId === currentCourt.courtId);
    const image = currentCourt.image;
    const time = currentCourt.time;
    const location = currentCourt.location;
    const fee = currentCourt.fee;
    const courtInfoDetail = <CourtInfoDetailItem image={image} time={time} location={location} fee={fee} currentUserLevel={props.currentUserLevel} playerListForCourt={playerListForCourt} feeStatusForCourt={feeStatusForCourt}/>;
    courtToRender.push(courtInfoDetail);
  })
  return (
    <div className="courtList">
      {courtToRender.map(item => item)}
    </div>
  )
}

function GetViewDependOnUserLevel(props:{currentUserLevel: any, playerListForCourt?: PlayerList, feeStatusForCourt?: FeeStatus[]}) {
      // Do userlist Filter by userlevel here!
      // For participant
      let participantView: React.ReactNode = null;
      let organizerView: React.ReactNode = null;
      let adminView: React.ReactNode = null;
      if (props.currentUserLevel === "participant" && props.playerListForCourt) {
       participantView = <ParticipantView playerListForCourt={props.playerListForCourt} feeStatusForCourt={props.feeStatusForCourt}/>
       return (participantView);
      }

      
      if (props.currentUserLevel === "organizer" && props.playerListForCourt) {
        organizerView = <OrganizerView playerListForCourt={props.playerListForCourt} feeStatusForCourt={props.feeStatusForCourt}/>
        return (organizerView);
      }

      if (props.currentUserLevel === "admin" && props.playerListForCourt) {
        adminView = <AdminView playerListForCourt={props.playerListForCourt} feeStatusForCourt={props.feeStatusForCourt}/>
        return (adminView);
      }
      
      return (<div></div>);
}


function CourtBooking() {
  const [courts,setCourts] = useState<Court[]|undefined>();
  getAllCourts().then(data=>{
    setCourts(data);
  });

  const [currentUserLevel,setCurrentUserLevel] = useState<UserLevel>(UserLevel.participant);
  // Edit when sampleData delete!!!
  const [allPlayerLists,setAllPlayerLists] = useState<PlayerList[]>(samplePlayerListData);
  const [feeStatus,setFeeStatus] = useState<FeeStatus[]>(sampleFeeStatusData);
  
  // Add third sample data
  // let currentTime = new Date();
  // const newSampleCourtData = {
  //   courtId: courts.length + 1,
  //   time: currentTime.toLocaleString(),
  //   location: "Cosports Badminton",
  //   fee: "$15",
  //   image:"https://lh5.googleusercontent.com/p/AF1QipN78ril9zsqLUGcmjDMVi-4yPrOWzeh3KfQuK4F=w203-h152-k-no",
  // };
  // useEffect(() => {
  //   setCourts([...courts, newSampleCourtData])
  //   console.log("triggerd")
  //   console.log("111")
  // },[])

   // Set userLevel
   const setUserLevel=() => {
    const userLevelButton =[]
    for (const [key, currentLevel] of Object.entries(UserLevel)) {
      const currentButton  = <button onClick={() =>setCurrentUserLevel(currentLevel)}>{currentLevel}</button>
      userLevelButton.push(currentButton)
    }
    return (
      <div>
        {
          userLevelButton.map(button => button)
        }
      </div>
    )
  }

  // Create court user input
  const [userInput,setUserInput] = useState({
    time: '',
    location:'',
    fee: '',
    image: '',
  });

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target
    setUserInput((prevInput) => ({ ...prevInput, [name]: value }));
  }

  function createCourtSubmit(event: React.FormEvent) {
    // event.preventDefault();
    // const newCourt: Court = {
    //   time: userInput.time,
    //   location: userInput.location,
    //   fee: userInput.fee,
    //   image: userInput.image,
    // };
    // setCourts(prevCourts =>[...prevCourts, newCourt]);


    setUserInput({
      time: '',
      location: '',
      fee: '',
      image: '',
    })
  }

  function CreateCourtForm({createCourtSubmit, onChange, userInput}: {
    createCourtSubmit: (event: React.FormEvent) => void,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    userInput: {
      time: string,
      location: string,
      fee: string,
      image: string,
    }}) 
    {
    return (
      <div className='createCourt'>
        <h1>Create Court</h1>
        <form onSubmit={createCourtSubmit}>
          <TextField
            type="text"
            name="time"
            placeholder='2024-01-12 8:00-10:00'
            value={userInput.time}
            label="Time"
            variant="filled"
            onChange={onChange}
          />
          <TextField
            type="text"
            name="location"
            placeholder='Clearone Number 3 Road'
            value={userInput.location}
            label="Location"
            variant="filled"
            onChange={onChange}
          />
          <TextField
            type="text"
            name="fee"
            placeholder='$15'
            label="Fee"
            variant="filled"
            value={userInput.fee}
            onChange={onChange}
          />
          <TextField
            type="text"
            name="image"
            placeholder='https://lh5.googleusercontent.com/p/AF1QipOirtLouebsSb1-SQ7yFpA344DvcwKqYDzQ1aBW=s773-k-no'
            value={userInput.image}
            label="image URL"
            variant="filled"
            onChange={onChange}
          />
          <Button variant="contained" type="submit">Create Court</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="courtBooking">
      <img className="App-logo" src={logoNoBackground} alt="logo"/>
      {/* Button for change user mode */}
      {setUserLevel()}
      <h1>currentUserLevel: {currentUserLevel}</h1>
      
      {/* Create courts */}
      <CreateCourtForm createCourtSubmit={createCourtSubmit} onChange={onChange} userInput={userInput} />
      
      {/* Court List */}
      <ShowCurrentCourtInfo courts={courts} currentUserLevel={currentUserLevel} allPlayerLists={allPlayerLists} feeStatus={feeStatus}/>
    </div>
  );
}

export default CourtBooking;