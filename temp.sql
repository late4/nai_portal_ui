/********* Nimono Core *********/

/* Basic user identity & Session management */

create table session_contexts(
	session_id varchar(50) not null,
	account_id int,
	login_id int,
	last_access_date datetime,
	initiated_date datetime,
	primary key(session_id)
);

create table login_credentials(
	login_id int not null auto_increment,
	login_name varchar(100) unique not null,
	digested_password varbinary(100) not null,
	account_id int not null,
	enabled boolean not null,
	created_date datetime not null,
	activation_code varchar(50),
	activation_initiated_date datetime,
	primary key(login_id)
);

create table accounts(
	account_id int not null,
	created_date datetime not null,
	primary key(account_id)
);

/********* Ticdzen *********/

/* Ticdzen user */

create table ticdzen_users(
	account_id int not null,
	name varchar(100) unique not null,
	role_id int not null,
	primary key(account_id)
);

create table roles(
	role_id int not null auto_increment,
	role_name varchar(50) unique not null,
	restricted boolean not null,
	administrator boolean not null,
	primary key(role_id)
);
/* 作って restricted for なに？*/
INSERT INTO roles (role_name, restricted, administrator) VALUES ('coordinator', 1, 1);
INSERT INTO roles (role_name, restricted, administrator) VALUES ('worker', 1, 0);
INSERT INTO roles (role_name, restricted, administrator) VALUES ('client', 0, 0);


/* Case */

create table cases(
	case_id int not null auto_increment,
	visible_case_id varchar(50) not null unique,
	repository_id int,
	workflow_id int,
	status enum('NEW','WORKFLOW_MANAGEMENT','COMPLETED'),
	primary key(case_id)
);

/* Workflow */

create table workflows(
	workflow_id int not null auto_increment,
	workflow_name varchar(100) unique not null,
	primary key(workflow_id)
);

create table workflow_milestones(
	workflow_id int not null,
	milestone_id double not null,
	type_id int not null,
	planned_start_date datetime not null,
	planned_end_date datetime not null,
	start_date datetime,
	end_date datetime,
	worker_account_id int,
	worker_assigned boolean,
	status enum('UNTOUCHED','INPROGRESS','COMPLETED','REVOKED') not null,
	completed_action_count int not null,
	primary key(workflow_id,milestone_id)
);

create table workflow_milestone_types(
	type_id int not null auto_increment,
	type_name varchar(20) not null,
	applicable_role_id int not null,
	primary key(type_id)
);
/* 作って */
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('OrderD', 3);
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('OrderP', 3);
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('TR', 2);
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('QAS', 2);
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('Deliv', 3);
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('INS', 3);
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('Edit', 2);
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('C-Edit', 2);
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('Rec', 2);
INSERT INTO workflow_milestone_types (type_name, applicable_role_id) VALUES('other', 2);


create table workflow_milestone_actions(
	type_id int not null,
	action_order int not null,
	class_name varchar(50) not null,
	method_name varchar(50) not null,
	worker_inherited boolean not null,
	additional_worker_role_id int not null,
	primary key(type_id,action_order)
);
/* 作って */
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(1, 0, 'GeneralConfirmationAPI', 'confirm', 1, 1);
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(2, 0, 'GeneralConfirmationAPI','confirm', 1, 1);
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(3, 0, 'GeneralConfirmationAPI','confirm', 0, 1);
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(4, 0, 'GeneralConfirmationAPI','confirm', 0, 1);
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(5, 0, 'GeneralConfirmationAPI','confirm', 1, 1);
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(6, 0, 'GeneralConfirmationAPI','confirm', 1, 1);
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(7, 0, 'GeneralConfirmationAPI','confirm', 0, 1);,
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(8, 0, 'GeneralConfirmationAPI','confirm', 0, 1);,
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(9, 0, 'GeneralConfirmationAPI','confirm', 0, 1);,
INSERT INTO workflow_milestone_actions (type_id, action_order, class_name, method_name, worker_inherited, additional_worker_role_id) VALUES(10, 0, 'GeneralConfirmationAPI','confirm', 0, 1);,

/* Repository */

create table repositories(
	repository_id int not null auto_increment,
	repository_name varchar(100) unique not null,
	primary key(repository_id)
);

create table repository_permissions(
	repository_id int not null,
	operator_identity int not null,
	operator_identity_type enum('ACCOUNT','ROLE') not null,
	permission_type enum('COMMITTER','ADMINISTRATOR') not null,
	primary key(repository_id,operator_identity,operator_identity_type)
);

create table repository_revisions(
	revision_id int not null auto_increment,
	reposiory_id int not null,
	revision_number int not null,
	revision_date datetime not null,
	revision_log varchar(140) not null,
	operating_login_id int not null,
	operation enum('COMMIT','REVERT') not null,
	primary key(revision_id)
);

create table repository_commits(
	revision_id int not null,
	file_name varchar(100) not null,
	file_reference varchar(300) not null,
	committer_login_id int not null,
	file_status enum('ADDED','UPDATED','REMOVED') not null,
	primary key(revision_id,file_name)
);

create table repository_reverts(
	revision_id int not null;
	reverting_point int not null;
	primary key(revision_id)
);

create table repository_revision_permissions(
	revision_id int not null,
	operator_identity int not null,
	operator_identity_type enum('ACCOUNT','ROLE') not null,
	permission_type enum('VISIBLE','EDITABLE') not null,
	primary key(repository_id,operator_identity,operator_identity_type)
);

/* Logging */

create table ticdzen_log(
	id int not null auto_increment,
	case_id int,
	class_name varchar(50) not null,
	method_name varchar(50) not null,
	param_json json not null,
	operating_login_id int not null,
	log_date datetime not null,
	primary key(id)
);

/********* NAIportal custom tables *********/






create table session_contexts(
        session_id varchar(50) not null,
        account_id int,
        login_id int,
        last_access_date datetime,
        initiated_date datetime,
        primary key(session_id)
);

create table login_credentials(
        login_id int not null auto_increment,
        login_name varchar(100) unique not null,
        digested_password varbinary(100) not null,
        account_id int not null,
        enabled boolean not null,
        created_date datetime not null,
        activation_code varchar(50),
        activation_initiated_date datetime,
        primary key(login_id)
);

create table accounts(
        account_id int not null,
        created_date datetime not null,
        primary key(account_id)
);


create table ticdzen_users(
        account_id int not null,
        name varchar(100) unique not null,
        role_id int not null,
        primary key(account_id)
);

create table roles(
        role_id int not null auto_increment,
        role_name varchar(50) unique not null,
        restricted boolean not null,
        administrator boolean not null,
        primary key(role_id)
);


create table cases(
        case_id int not null auto_increment,
        visible_case_id varchar(50) not null unique,
        repository_id int,
        workflow_id int,
        status enum('NEW','WORKFLOW_MANAGEMENT','COMPLETED'),
        primary key(case_id)
);

create table workflows(
        workflow_id int not null auto_increment,
        workflow_name varchar(100) unique not null,
        primary key(workflow_id)
);

create table workflow_milestones(
        workflow_id int not null,
        milestone_id double not null,
        type_id int not null,
        planned_start_date datetime not null,
        planned_end_date datetime not null,
        start_date datetime,
        end_date datetime,
        worker_account_id int,
        worker_assigned boolean,
        status enum('UNTOUCHED','INPROGRESS','COMPLETED','REVOKED') not null,
        completed_action_count int not null,
        primary key(workflow_id,milestone_id)
);

create table workflow_milestone_types(
        type_id int not null auto_increment,
        type_name varchar(20) not null,
        applicable_role_id int not null,
        primary key(type_id)
);

create table workflow_milestone_actions(
        type_id int not null,
        action_order int not null,
        class_name varchar(50) not null,
        method_name varchar(50) not null,
        worker_inherited boolean not null,
        additional_worker_role_id int not null,
        primary key(type_id,action_order)
);


create table repositories(
        repository_id int not null auto_increment,
        repository_name varchar(100) unique not null,
        primary key(repository_id)
);

create table repository_permissions(
        repository_id int not null,
        operator_identity int not null,
        operator_identity_type enum('ACCOUNT','ROLE') not null,
        permission_type enum('COMMITTER','ADMINISTRATOR') not null,
        primary key(repository_id,operator_identity,operator_identity_type)
);

create table repository_revisions(
        revision_id int not null auto_increment,
        reposiory_id int not null,
        revision_number int not null,
        revision_date datetime not null,
        revision_log varchar(140) not null,
        operating_login_id int not null,
        operation enum('COMMIT','REVERT') not null,
        primary key(revision_id)
);

create table repository_commits(
        revision_id int not null,
        file_name varchar(100) not null,
        file_reference varchar(300) not null,
        committer_login_id int not null,
        file_status enum('ADDED','UPDATED','REMOVED') not null,
        primary key(revision_id,file_name)
);

create table repository_reverts(
        revision_id int not null;
        reverting_point int not null;
        primary key(revision_id)
);

create table repository_revision_permissions(
        revision_id int not null,
        operator_identity int not null,
        operator_identity_type enum('ACCOUNT','ROLE') not null,
        permission_type enum('VISIBLE','EDITABLE') not null,
        primary key(repository_id,operator_identity,operator_identity_type)
);

create table ticdzen_log(
        id int not null auto_increment,
        case_id int,
        class_name varchar(50) not null,
        method_name varchar(50) not null,
        param_json json not null,
        operating_login_id int not null,
        log_date datetime not null,
        primary key(id)
);
