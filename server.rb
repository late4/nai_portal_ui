#!/usr/bin/ruby
# -*- coding: utf-8 -*-

# modules
# =======
require 'sinatra'
require 'uri'
require 'aws-sdk'

# debug
# =====
require 'pp'
require 'net/http'

# IP Addr/Port
# ============
set :bind, ENV["IP"]
set :port, ENV["PORT"]

# constants
# =========
NOTIFICATION_SUBID_PATH = '/home/portal/web/tmp/subid'
GOOGLE_API_KEY = 'AIzaSyBJrqFoisZ4mZIj1DigRpyX5i5VtE_ScyE'
GCM_URI = 'https://android.googleapis.com/gcm/send'

COMMON_JSES  = %w[ js/base.js js/ejs.js ]
COMMON_CSSES = %w[ css/base.css css/decorations4.css ]
TITLE_PREFIX = "NAIportal Coordinator View - "

TABS = {
  :home => {
    :title => TITLE_PREFIX + "Home",
    :jses =>  COMMON_JSES  +  %w[ notification/js/main.js js/list.js js/casesfilter.js js/langselector.js ],
    :csses => COMMON_CSSES +  %w[ css/caseslist.css ],
    :lpparams => %w[ ejs/base.ejs ejs/home.ejs ]
  },
  :cases => {
    :title => TITLE_PREFIX + "Cases",
    :jses =>  COMMON_JSES  + %w[ js/list.js js/casesfilter.js js/langselector.js ],
    :csses => COMMON_CSSES + %w[ css/caseslist.css ],
    :lpparams => %w[ ejs/base.ejs ejs/cases.ejs ]
  },
  :messages => {
    :title => TITLE_PREFIX + "Messages",
    :jses =>  COMMON_JSES  + %w[ js/list.js js/messagesfilter.js  ],
    :csses => COMMON_CSSES + %w[ css/messageslist.css ],
    :lpparams => %w[ ejs/base.ejs ejs/messages.ejs ]
  },
  :calendar => {
    :title => TITLE_PREFIX + "Calendar",
    :jses =>  COMMON_JSES  + %w[ ],
    :csses => COMMON_CSSES + %w[ css/caseslist.css ],
    :lpparams => %w[ ejs/base.ejs ejs/calendar.ejs ]
  },
  :bills => {
    :title => TITLE_PREFIX + "Bills",
    :jses =>  COMMON_JSES  + %w[ js/list.js js/billsfilter.js ],
    :csses => COMMON_CSSES + %w[ css/billslist.css ],
    :lpparams => %w[ ejs/base.ejs ejs/bills.ejs ]
  },
  :clients => {
    :title => TITLE_PREFIX + "Clients",
    :jses =>  COMMON_JSES  + %w[ js/list.js js/clientsfilter.js ],
    :csses => COMMON_CSSES + %w[ css/clientslist.css ],
    :lpparams => %w[ ejs/base.ejs ejs/clients.ejs ]
  },
  :workers => {
    :title => TITLE_PREFIX + "Workers",
    :jses =>  COMMON_JSES  + %w[ js/list.js js/workersfilter.js ],
    :csses => COMMON_CSSES + %w[ css/workerslist.css ],
    :lpparams => %w[ ejs/base.ejs ejs/workers.ejs ]
  },
  :managements => {
    :title => TITLE_PREFIX + "Managements",
    :jses =>  COMMON_JSES  + %w[  ],
    :csses => COMMON_CSSES + %w[  ],
    :lpparams => %w[ ejs/base.ejs ejs/managements.ejs ]
  }
}

# main
# ====

#class ServerApp < Sinatra::Base

def jsparams(a)
  q = []
  a.each do |p|
    q.push("'#{p}'")
  end
  return q.join(',')
end

TABS.keys.each do |key|
  get '/' + key.to_s do
    @e = TABS[key]
    erb :gentab
  end
end

get '/' do
  redirect '/login'
end

get '/login' do
  @prev_username = session[:prev_username]
  @login_message = session[:login_message]
  session.clear
  erb :login
end

post '/auth' do
  if params[:username] == 'late4@134.co.jp' && params[:password] == 'hogehoge'
  	session[:username] = params[:username]
	redirect '/home'
  else
    session[:login_message] = 'Username and/or password are wrong'
    session[:prev_username] = params[:username]
    redirect '/login'
  end
end

get '/logout' do
  session.clear
  session[:login_message] = 'Thank you for using NAIportal'
  redirect '/'
end

post '/notification/register' do
  uri = request.body.read
  uri =~ /https:\/\/android.googleapis.com\/gcm\/send\/(.+)$/

  File.write(NOTIFICATION_SUBID_PATH, $1)
  'OK'
end

get '/notification/id' do
  File.read(NOTIFICATION_SUBID_PATH)
end

get '/notification/notify' do
  subid = File.read(NOTIFICATION_SUBID_PATH)
  uri = URI.parse(GCM_URI)
  https = Net::HTTP.new(uri.host, uri.port)
  https.use_ssl = true

  req = Net::HTTP::Post.new(uri.request_uri)
  data = { "registration_ids" => [subid] }
  data_json = data.to_json
  req.body = data_json
  req["Content-Type"] = "application/json"
  req["Authorization"] = "key="+GOOGLE_API_KEY
  https.request(req)
  'OK'
end

get '/case/:epc' do
  case params[:epc]
    when "urn:epc:id:gdti:457337761.001.1" then
      erb :case_detail1
    when "urn:epc:id:gdti:457337761.001.2" then
      erb :case_detail2
    else
     halt "No such EPC"
  end
end

get '/client/:id' do
  erb :client_detail
end

get '/worker/:id' do
  erb :worker_detail
end

get '/core-api-test' do
  lambda = Aws::Lambda::Client.new(region:"ap-northeast-1") # XXX: ~/.aws/config not read?
  
  begin
    param = { :name => "134" }
    req = { :className => "TestAPI", :methodName => "helloName", :paramJSON => param.to_json }
    req_json = req.to_json
    resp = lambda.invoke( function_name: "portalcore", payload: req_json )

    resp.payload
  rescue => e
    e.message
  end
end

post '/req' do
  lambda = Aws::Lambda::Client.new(region:"ap-northeast-1") # XXX
  
  begin
      param = request.body.read
      resp = lambda.invoke( function_name: "portalcore", payload: param)
      
      if resp[:status_code] != 200
        raise "Response code " + resp[:status_code].to_s + " from NIMONO Core¥n¥n" + resp.payload.read
      end

      JSON.parse('[' + resp.payload.read + ']').first # XXX: bare string is not valid as JSON
  rescue Aws::Lambda::Errors::ServiceError => e # errors in Lambda world
      raise "[AWS Lambda] " + e.message
  rescue => e
      raise "[General] " + e.message
  end
end

error do
  "NIMONO Frontend ERROR: " + env['sinatra.error'].message
end