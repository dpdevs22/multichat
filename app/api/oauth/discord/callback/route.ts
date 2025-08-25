if (platform === 'twitch') {
    const u = await fetch('https://api.twitch.tv/helix/users', {
      headers: { 'Authorization': `Bearer ${access_token}`, 'Client-Id': process.env.TWITCH_CLIENT_ID! }
    })
    const j = await u.json()
    const me = j.data?.[0]
    external_user_id = me?.id || ''
    username = me?.display_name || me?.login || ''
  } else if (platform === 'youtube') {
    const u = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    })
    const me = await u.json()
    external_user_id = me?.sub || ''
    username = me?.name || me?.email || ''
  } else if (platform === 'discord') {
    const u = await fetch('https://discord.com/api/users/@me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    })
    const me = await u.json()
    external_user_id = me?.id || ''
    username = me?.username || ''
  } else if (platform === 'tiktok') {
    const u = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${access_token}` }
    })
    const j = await u.json() as any
    const me = j?.data?.user || j?.data
    external_user_id = me?.open_id || ''
    username = me?.display_name || me?.username || ''
  }