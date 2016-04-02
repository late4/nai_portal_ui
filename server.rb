#!/usr/bin/ruby
# -*- coding: utf-8 -*-

# modules
# =======
require 'sinatra'
require 'uri'

# debug
# =====
require 'pp'
require 'net/http'

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
enable :sessions

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
