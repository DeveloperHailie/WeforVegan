create table Users (
	UserID int primary key auto_increment,
    UserEmail varchar(50) unique not null,
    UserPwd varchar(50) not null,
    UserName varchar(50)Users
);