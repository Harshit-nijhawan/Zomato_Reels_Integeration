import React, { useEffect, useState, useRef } from 'react'
import '../../styles/profile.css'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const Profile = () => {
    const { id } = useParams()
    const [ profile, setProfile ] = useState(null)
    const [ videos, setVideos ] = useState([])

    useEffect(() => {
    const token = localStorage.getItem("token") // Step A: get your JWT token

    if (!token) { 
        console.error("No token found. User may not be logged in.") // optional
        return
    }

    axios.get(`${import.meta.env.VITE_API_URL}/food-partner/${id}`, {
        headers: {
            Authorization: `Bearer ${token}` // Step B: add the token in Authorization header
        }
    })
    .then(response => {
        setProfile(response.data.foodPartner)
        setVideos(response.data.foodPartner.foodItems)
    })
    .catch(err => {
        console.error("API error:", err.response?.data || err.message)
    })
}, [id])


    const videoRefs = useRef({})
    const [playingId, setPlayingId] = useState(null)

    const togglePlay = (id) => {
        const vid = videoRefs.current[id]
        if (!vid) return

        // pause all others
        Object.entries(videoRefs.current).forEach(([k, v]) => {
            if (k !== id && v && !v.paused) {
                v.pause()
                v.muted = true
            }
        })

        if (vid.paused) {
            // unmute when user explicitly plays
            try { vid.muted = false } catch (e) { /* noop */ }
            vid.play().catch(() => { /* autoplay may fail */ })
            setPlayingId(id)
        } else {
            vid.pause()
            try { vid.muted = true } catch (e) {}
            setPlayingId(null)
        }
    }

    return (
        <main className="profile-page">
            <section className="profile-header">
                <div className="profile-meta">

                    <img className="profile-avatar" src="https://shorturl.at/cPxMw" alt="" />

                    <div className="profile-info">
                        <h1 className="profile-pill profile-business" title="Business name">
                            {profile?.name}
                        </h1>
                        <p className="profile-pill profile-address" title="Address">
                            {profile?.address}
                        </p>
                    </div>
                </div>

                <div className="profile-stats" role="list" aria-label="Stats">
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">total meals</span>
                        <span className="profile-stat-value">{profile?.totalMeals}</span>
                    </div>
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">customer served</span>
                        <span className="profile-stat-value">{profile?.customersServed}</span>
                    </div>
                </div>
            </section>

            <hr className="profile-sep" />

            <section className="profile-grid" aria-label="Videos">
                {videos.map((v) => (
                    <div
                        key={v._id}
                        className="profile-grid-item"
                        onClick={() => togglePlay(v._id)}
                        role="button"
                        aria-label={playingId === v._id ? "Pause video" : "Play video"}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePlay(v._id) } }}
                    >
                        <video
                            ref={(el) => { videoRefs.current[v._id] = el }}
                            className="profile-grid-video"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            src={v.video}
                            muted
                            playsInline
                            preload="metadata"
                        />
                        <div className="play-icon" aria-hidden="true">
                            {playingId === v._id ? '⏸' : '▶'}
                        </div>
                    </div>
                ))}
            </section>
        </main>
    )
}

export default Profile