import { Typography } from "@mui/material";
import Box from '@mui/material/Box';
import { motion, color, useMotionValue, useTransform } from "framer-motion";
import { Game } from "../interfaces";
import { tomato } from "../styles/theme";
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';

export default function SessionSwiping({ game, onDragEnd }: { game: Game, onDragEnd: (event: any, info: any, game: Game) => void }) {
    const x = useMotionValue(0);
    const xInput = [-100, 0, 100];
    const rotate = useTransform(x, [-230, 230], [-38, 38])
    const color = useTransform(x, xInput, [
      "rgb(255, 0, 0)",
      "rgb(0, 0, 255)",
      "rgb(3, 209, 0)"
    ]);
    const tickPath = useTransform(x, [10, 50], [0, 1]);
    const crossPathA = useTransform(x, [-10, -35], [0, 1]);
    const crossPathB = useTransform(x, [-30, -50], [0, 1]);
    
    return (<Box sx={{ position: "absolute", width: "100%", overflow: "hidden", userSelect: "none" }} key={`box-${game.id}`}>
        <motion.div className="container" style={{ backgroundColor: "transparent" }} key={`container-${game.id}`} >
            <motion.div
                className="box"
                style={{ x, rotate, opacity: 1 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                key={game.id}
                onDragEnd={async (event, info) => await onDragEnd(event, info, game)}
            >
                <Box key={game.id} sx={{
                    width: "100%",
                    minHeight: "100%",
                    backgroundImage: `linear-gradient(to bottom, transparent 30%, black), url("${game.image_url}");`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundColor: "transparent",
                    position: "relative"
                }}>
                    <Box sx={{ position: "absolute", bottom: "5%", margin: 3, userSelect: "none" }}>
                        <Typography sx={{ textShadow: "1px 1px 7px black" }}>{game.name}, <FavoriteIcon sx={{ fontSize: 15, color: tomato }} /> {game.avg_rating}</Typography>
                        <Typography sx={{ fontSize: 12, textShadow: "1px 1px 7px black" }}>{game?.primary_publisher?.name ?? "unknown publisher"}</Typography>
                        <Typography sx={{ fontSize: 12, textShadow: "1px 1px 7px black" }}><PeopleIcon sx={{ fontSize: 15, color: "secondary.main" }} />&nbsp;{game.ownedBy.map(o => o.name).join(", ")}</Typography>
                        {
                            window.innerWidth > 600 && <Typography sx={{ fontSize: 12, textShadow: "1px 1px 7px black" }}>{game.description_preview.split('.').slice(0, 4).join(". ")}</Typography>
                        }
                    </Box>
                    <svg className="progress-icon" viewBox="0 0 50 50">
                        <motion.path
                            fill="none"
                            strokeWidth="2"
                            stroke={color}
                            key={`p2-${game.id}`}
                            d="M14,26 L 22,33 L 35,16"
                            strokeDasharray="0 1"
                            style={{ pathLength: tickPath, opacity: 1 }}
                        />
                        <motion.path
                            fill="none"
                            strokeWidth="2"
                            stroke={color}
                            key={`p3-${game.id}`}
                            d="M17,17 L33,33"
                            strokeDasharray="0 1"
                            style={{ pathLength: crossPathA, opacity: 1 }}
                        />
                        <motion.path
                            fill="none"
                            strokeWidth="2"
                            stroke={color}
                            key={`p4-${game.id}`}
                            d="M33,17 L17,33"
                            strokeDasharray="0 1"
                            style={{ pathLength: crossPathB, opacity: 1 }}
                        />
                    </svg>
                </Box>
            </motion.div>
        </motion.div>
    </Box>)
}