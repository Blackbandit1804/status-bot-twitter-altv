// event listeners

addEventListener('scheduled', event => {
  event.waitUntil(
    handleSchedule(event.scheduledTime)
  )
})

// twitter helper functions

async function makenonce() {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < 11; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

async function gettimestamp() {
    return Math.floor(Date.now() / 1000)
}

async function timesince(start) {
    const launch_date = new Date(start);
    const now = new Date();
    const diffTime = Math.abs(now - launch_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffhoursmissing = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffminutesmissing = Math.ceil(diffTime / (1000 * 60));

    let launch_days = diffDays;
    let launch_hours_missing = diffhoursmissing - ((diffDays) * 24);
    let launch_minutes_missing = 60 - ((diffminutesmissing - (diffhoursmissing * 60)) * -1);

    if (launch_hours_missing <= 0) {
        launch_days = launch_days -1
        if (launch_hours_missing === 24) {
            launch_hours_missing = 0;
        } else if (launch_hours_missing <= 0) {
            launch_hours_missing = launch_hours_missing * -1;
            launch_hours_missing = 24 - launch_hours_missing;
            launch_hours_missing = Math.floor(((launch_hours_missing * 60) - ((diffminutesmissing - (diffhoursmissing * 60)) * -1)) / 60);
        }
    }

        
    let daytext;
    let hourtext;
    let minutestext;

        
    if (launch_days >= 1 || launch_days === 0) {
        daytext = `${launch_days} Days`;
    } else {
        daytext = `one Day`
    }

    if (launch_hours_missing > 1 || launch_hours_missing === 0) {
        hourtext = `${launch_hours_missing} Hours`
    } else (
        hourtext = `one Hour`
    )

    if (launch_minutes_missing >= 1 || launch_minutes_missing === 0) {
        minutestext = `${launch_minutes_missing} Minutes`
    } else (
        minutestext = `one Minute`
    )
    return { daytext, hourtext, minutestext }
}

async function gatherResponse(response) {
    return await response.json()
}

// Twitter function

async function twitterdescription(text) {
    let url = "https://api.twitter.com/1.1/account/update_profile.json";
    let timestamp = await gettimestamp();
    let nonce = await makenonce();
    let auth_before = `OAuth oauth_consumer_key="${OAUTH_CONSUMER_KEY}",oauth_token="${OAUTH_TOKEN}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0"`
    // replace YOUR ENCODED TWITTER NAME HERE below here
    // https://www.urlencoder.io/
    let parameter_string = `description=${encodeURIComponent(text)}&name=YOUR ENCODED TWITTER NAME HERE&oauth_consumer_key=${OAUTH_CONSUMER_KEY}&oauth_nonce=${nonce}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${timestamp}&oauth_token=${OAUTH_TOKEN}&oauth_version=1.0`
    let sig_base_string = `POST&${encodeURIComponent(url)}&${encodeURIComponent(parameter_string)}`
    let signing_key = `${encodeURIComponent(CONSUMER_SECRET)}&${encodeURIComponent(OAUTH_TOKEN_SECRET)}`

    const encoder = new TextEncoder()
    const secretKeyData = encoder.encode(signing_key)
    const key = await crypto.subtle.importKey(
        "raw",
        secretKeyData,
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"],
    )

    let signature = await crypto.subtle.sign("HMAC", key, encoder.encode(sig_base_string));
    const real_signature = btoa(String.fromCharCode(...new Uint8Array(signature)))

    let auth_header = `OAuth oauth_consumer_key="${OAUTH_CONSUMER_KEY}",oauth_token="${OAUTH_TOKEN}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0",oauth_signature="${encodeURIComponent(real_signature)}"`
    // replace YOUR ENCODED TWITTER NAME HERE below here
    // https://www.urlencoder.io/
    let response = await fetch(`${url}?name=YOUR ENCODED TWITTER NAME HERE&description=${encodeURIComponent(text)}`, {
        method: "POST",
        headers: {
            "authorization": `${auth_header}`
        }
    })
}

async function twittertweet(text) {
    let url = "https://api.twitter.com/1.1/statuses/update.json";
    let timestamp = await gettimestamp();
    let nonce = await makenonce();
    let auth_before = `OAuth oauth_consumer_key="${OAUTH_CONSUMER_KEY}",oauth_token="${OAUTH_TOKEN}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0"`
    let parameter_string = `oauth_consumer_key=${OAUTH_CONSUMER_KEY}&oauth_nonce=${nonce}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${timestamp}&oauth_token=${OAUTH_TOKEN}&oauth_version=1.0&status=${encodeURIComponent(text)}`
    let sig_base_string = `POST&${encodeURIComponent(url)}&${encodeURIComponent(parameter_string)}`
    let signing_key = `${encodeURIComponent(CONSUMER_SECRET)}&${encodeURIComponent(OAUTH_TOKEN_SECRET)}`

    const encoder = new TextEncoder()
    const secretKeyData = encoder.encode(signing_key)
    const key = await crypto.subtle.importKey(
        "raw",
        secretKeyData,
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"],
    )

    let signature = await crypto.subtle.sign("HMAC", key, encoder.encode(sig_base_string));
    const real_signature = btoa(String.fromCharCode(...new Uint8Array(signature)))

    let auth_header = `OAuth oauth_consumer_key="${OAUTH_CONSUMER_KEY}",oauth_token="${OAUTH_TOKEN}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0",oauth_signature="${encodeURIComponent(real_signature)}"`
    let response = await fetch(`${url}?status=${encodeURIComponent(text)}`, {
        method: "POST",
        headers: {
            "authorization": `${auth_header}`
        }
    })
}

// Scheduled events below

async function handleSchedule(scheduledDate) {
    let serverid = ALTV_SERVER_ID;
    let last_state = await Storage.get("last_update")
    let player_record = await Storage.get("player_record")

    const init = {
      cf: {
        cacheTtl: 120,
        cacheEverything: true
      },
      headers: {
        "content-type": "application/json;charset=UTF-8",
      }
    }
    const response = await fetch(`https://api.altv.mp/server/${serverid}`, init)
    const results = await gatherResponse(response)

    await handleTweetDescription(results)

    if (results.active.toString() !== last_state.toString()) {
        await handleTweetStatus(results)
    } else {
        await Storage.put("last_online", new Date().toString())
    }

    await Storage.put("last_update", results.active.toString())

    // Handle Player Record Here (Don´t Spam it at every new Record +5 should be enough!)
    if (results.info.players > (Number(player_record) + 5)) {
        await handlePlayerRecord(results.info.players)
    }
}

async function handleTweetDescription(results) {
    let state;
    if (results.active) {
        state = "online"
    } else {
        state = "offline"
    }
    let description = `Server: ${state} 
Players: ${results.info.players}/${results.info.maxPlayers} 
    
#CloudflareWorkers #altv #LuckyV`
    await twitterdescription(description)
}

async function handleTweetStatus(results) {
    let status = results.active;
    let last_online = await Storage.get("last_online")
    let downtime = await timesince(last_online);
    let downtime_string = `${downtime.daytext} ${downtime.hourtext} ${downtime.minutestext}`
    if (status == true) {
        await twittertweet(`The Server is back Online. 
Downtime: ${downtime_string}
#YourServerName`)
    } else if (status == false) {
        await twittertweet(`The Server is Offline.
#YourServerName`)
    }
}

async function handlePlayerRecord(newplayers) {
    await twittertweet(`The Server reached a new Player record with ${newplayers} Players!
#YourServerName`)
    await Storage.put("player_record", newplayers)
}
