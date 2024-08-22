import Navbar from "../components/Web/Narbar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/ApiClient";

async function sendComment(setMessage, selectedBadges, comment) {

    if (!comment) {
        setMessage("Por favor, no comentarios vacíos.");
        return;
    }

    var Data = {
        content: comment,
        CreatedAt: new Date().toLocaleString(),
        Labels: selectedBadges,
    };

    console.log(Data)

    try {
        const response = await api.post(`/comment`, Data);
        console.log(response.status);

        if (response.status === 200) {
            window.location.href = "/";
        } else if (response.status === 500) {
            setMessage("Error al crear comentario");
        } else {
            setMessage("Error desconocido");
        }
    } catch (error) {
        console.error("Error:", error);
        setMessage("Ha ocurrido un error al procesar tu solicitud.");
    }

}

const About = () => {

    const [message, setMessage] = useState("");
    const [selectedBadges, setSelectedBadges] = useState([]);
    const [comment, setComment] = useState("");

    const toggleBadge = (badge) => {
        if (selectedBadges.includes(badge)) {
            setSelectedBadges(selectedBadges.filter((selectedBadge) => selectedBadge !== badge));
        } else {
            setSelectedBadges([...selectedBadges, badge]);
        }
    };

    const badgeClass = (badge) => {
        return selectedBadges.includes(badge) ? 'badge badge-accent mr-1' : 'badge badge-neutral mr-1';
    };


    const navigate = useNavigate();
    return (
        <div className="flex-1">
            {/* Navbar*/}
            <Navbar logohidden={true} />
            {/* Contenido dentro de la imagen */}
            <div className="hero min-h-screen bg-fixed" style={{
                backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnN2Z2pzPSJodHRwOi8vc3ZnanMuZGV2L3N2Z2pzIiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI1NjAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHZpZXdCb3g9IjAgMCAxNDQwIDU2MCI+PGcgbWFzaz0idXJsKCZxdW90OyNTdmdqc01hc2sxMDAwJnF1b3Q7KSIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjE0NDAiIGhlaWdodD0iNTYwIiB4PSIwIiB5PSIwIiBmaWxsPSIjMGUyYTQ3Ij48L3JlY3Q+PHBhdGggZD0iTTE0MCAwQzE0MCAwIDE0MCAwIDE0MCAwQzIxMCAyMSAyMTIuNCA0MiAyODAgNDJDMzE5LjE1IDQyIDMxNC4zIDExLjc2IDM1My41IDBDMzg0LjMgLTkuMjQgMzg2Ljc1IDAgNDIwIDBDNDU5LjEyIDAgNDY4LjIzIC0xOC4wMSA0OTguMjQgMEM1MzguMjMgMjMuOTkgNTM1LjE4IDg0IDU2MCA4NEM1ODEuMjcgODQgNTU4Ljk5IDE4Ljg2IDU5MC40MyAwQzYyOC45OSAtMjMuMTQgNjQ1LjIxIDAgNzAwIDBDNzcwIDAgNzcwIDAgODQwIDBDOTEwIDAgOTEwIDAgOTgwIDBDMTA0Ni44MiAwIDEwODUuMzQgLTM0LjA1IDExMTMuNjQgMEMxMTQzLjUxIDM1Ljk1IDEwOTQuMTQgNzEuNDUgMTA5Ni4zNCAxNDBDMTA5Ny4zMiAxNzAuNDEgMTA5NC45MiAxOTIuMzMgMTEyMCAxOTcuOTNDMTE3Ni43NSAyMTAuNTkgMTE5NC40NCAxOTcuMTQgMTI2MCAxNzYuNTJDMTI4Ni41NCAxNjguMTcgMTMwNC4yMSAxNjIuMDEgMTMwNC4yMSAxNDBDMTMwNC4yMSAxMDcuMjMgMTI5Mi4wMSA5Mi45MyAxMjYwIDY2Ljk2QzEyMDUuNzQgMjIuOTMgMTEzMS42NyAxNy43NSAxMTMxLjY3IDBDMTEzMS42NyAtMTUuNzMgMTE5NS44NCAwIDEyNjAgMEMxMzMwIDAgMTMzMCAwIDE0MDAgMEMxNDcwIDAgMTUwNSAtMzUgMTU0MCAwQzE1NzUgMzUgMTU0MCA3MCAxNTQwIDE0MEMxNTQwIDIxMCAxNTQwIDIxMCAxNTQwIDI4MEMxNTQwIDM1MCAxNTQwIDM1MCAxNTQwIDQyMEMxNTQwIDQ1Mi41IDE1NTQuOTggNDU5LjAzIDE1NDAgNDg1QzE1MTQuNiA1MjkuMDMgMTUwNC43NiA1MzUuNjEgMTQ1OS4yMyA1NjBDMTQzNC43NiA1NzMuMTEgMTQyOS42MSA1NjAgMTQwMCA1NjBDMTM3NS4xNiA1NjAgMTM3MS42NyA1NzAuNDEgMTM1MC4zMiA1NjBDMTMwMS42NyA1MzYuMjcgMTMxMC42MyA0OTkuMDQgMTI2MCA0OTEuNzFDMTE5NS40NyA0ODIuMzcgMTE4OC45OSA1MDUuOTYgMTEyMCA1MjYuNjdDMTA3NS4yNCA1NDAuMTEgMTA3Ny4zNSA1NDkuMzIgMTAzMi41IDU2MEMxMDA3LjM1IDU2NS45OSAxMDA2LjI1IDU2MCA5ODAgNTYwQzkxMCA1NjAgOTEwIDU2MCA4NDAgNTYwQzc3MCA1NjAgNzcwIDU2MCA3MDAgNTYwQzY1Ny4xIDU2MCA2MzUuMjQgNTg2LjMyIDYxNC4xOSA1NjBDNTc5LjI0IDUxNi4zMiA2MDkuODkgNDg0LjI2IDU4OCA0MjBDNTgyLjc5IDQwNC43MSA1NzYuMzUgNDAzLjU3IDU2MCA0MDAuOTFDNDkyLjM1IDM4OS44OSA0ODYuNyAzODUuNDggNDIwIDM5Mi42NEMzOTcuODEgMzk1LjAyIDM4Mi4yMiA0MDEuMzcgMzgyLjIyIDQyMEMzODIuMjIgNDU2LjA4IDM5Ni44NCA0NjMuNjggNDIwIDUwMi4wN0M0MzkuMDcgNTMzLjY4IDQ2Ni42NyA1NDIuMiA0NjYuNjcgNTYwQzQ2Ni42NyA1NzEuMTcgNDQzLjM0IDU2MCA0MjAgNTYwQzM1MCA1NjAgMzUwIDU2MCAyODAgNTYwQzIxMS44NCA1NjAgMTg5LjkxIDU4My4xMSAxNDMuNjggNTYwQzExOS45MSA1NDguMTEgMTQyLjY3IDUyNC45NCAxNDAgNDkwQzEzNy4zMyA0NTQuOTQgMTUyLjk3IDQ0Ni40OCAxMzMgNDIwQzgyLjk3IDM1My42NiA1OC40MyAzNjUuODUgMCAzMDQuMzVDLTguMDcgMjk1Ljg1IDAgMjkyLjE3IDAgMjgwQzAgMjEwIDAgMjEwIDAgMTQwQzAgNzAgLTM1IDM1IDAgMEMzNSAtMzUgNzAgMCAxNDAgMCIgc3Ryb2tlPSJyZ2JhKDUxLCAxMjEsIDE5NCwgMC41OCkiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPjxwYXRoIGQ9Ik03MDAgMTAwLjhDNjUwLjQ1IDEwNi40NCA2MDUuMTYgMTE4LjM4IDYwNS4xNiAxNDBDNjA1LjE2IDE2Mi40OCA2NDkuMzcgMTc1LjEzIDcwMCAxODlDNzY2Ljc5IDIwNy4yOSA3ODMuMiAyMjAuNTcgODQwIDIwNC4zMkM4NjguODYgMTk2LjA3IDg3MS4zMiAxNjguOSA4NzEuMzIgMTQwQzg3MS4zMiAxMjMuMzcgODU5LjQxIDExNy43IDg0MCAxMTMuMjZDNzczLjc1IDk4LjEgNzY3Ljg3IDkzLjA3IDcwMCAxMDAuOCIgc3Ryb2tlPSJyZ2JhKDUxLCAxMjEsIDE5NCwgMC41OCkiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPjxwYXRoIGQ9Ik05ODAgMjQwLjczQzk0Mi4yNyAyNDAuNzMgOTA1LjEyIDI0OS4yMiA5MDUuMTIgMjgwQzkwNS4xMiAzMzUuOTQgOTQxLjUxIDQxNC4xNyA5ODAgNDE0LjE3QzEwMTkuMiA0MTQuMTcgMTA2MC41IDMzNS4xNSAxMDYwLjUgMjgwQzEwNjAuNSAyNDguNDMgMTAxOS45NiAyNDAuNzMgOTgwIDI0MC43MyIgc3Ryb2tlPSJyZ2JhKDUxLCAxMjEsIDE5NCwgMC41OCkiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPjxwYXRoIGQ9Ik0wIDUwNS44MUM0Ni42IDUwNS44MSAxMjkuMjMgNTQ1LjkgMTI5LjIzIDU2MEMxMjkuMjMgNTczIDQ1LjUzIDU3OS4wOSAwIDU2MEMtMTkuMDkgNTUxLjk5IC0xOC4wMiA1MDUuODEgMCA1MDUuODEiIHN0cm9rZT0icmdiYSg1MSwgMTIxLCAxOTQsIDAuNTgpIiBzdHJva2Utd2lkdGg9IjIiPjwvcGF0aD48cGF0aCBkPSJNMzcuMzMgMTQwQzU4LjA1IDkyLjMxIDgzLjc4IDg1LjU5IDE0MCA3NC40N0MyMDUuMTIgNjEuNTkgMjExLjQ3IDk4LjggMjgwIDkyQzM1MS40NyA4NC45IDM2Mi42MiAzMy4wNSA0MjAgNDYuNjdDNDYzLjczIDU3LjA1IDQ0My4zMiAxMDEuNjYgNDgyLjIyIDE0MEM1MTMuMzIgMTcwLjY2IDUxOS44MiAxNjQuODggNTYwIDE4NC42OEM2MjguNzEgMjE4LjU0IDYyOC43MSAyMTkuMzkgNzAwIDI0Ny4zM0M3NTAuMjkgMjY3LjA1IDc1MS44OCAyNjIuOCA4MDMuMTYgMjgwQzgyMS44OCAyODYuMjggODI3LjA1IDI4MC4wNyA4NDAgMjk0LjI5Qzg5MC43NyAzNTAuMDcgOTE2LjU4IDM1MS4yOSA5MzAuNTkgNDIwQzk0My42NyA0ODQuMTQgOTI3LjE0IDUwOS4wOCA4OTQuMTkgNTYwQzg4MS44NSA1NzkuMDggODY3LjEgNTYwIDg0MCA1NjBDNzcwIDU2MCA3NzAgNTYwIDcwMCA1NjBDNjg1LjMzIDU2MCA2NzMuNjEgNTcyLjEzIDY3MC42NSA1NjBDNjU2LjUgNTAyLjEzIDY5NC42OSA0NzUuNDIgNjY1Ljc4IDQyMEM2MzkuMzYgMzY5LjM2IDYxOC42OCAzNjQuMDIgNTYwIDM0Ny44OEM0OTUuNzkgMzMwLjIyIDQ4NC4wMSAzMzIuNjMgNDIwIDM1Mi40MUMzNjcuMzQgMzY4LjY5IDM0My4wMSAzNzMuNDEgMzI2LjY3IDQyMEMzMDYuNjEgNDc3LjIxIDM2My4wMiA1MTIuNTQgMzQ3LjIgNTYwQzMzOS42OSA1ODIuNTQgMzEzLjYgNTYwIDI4MCA1NjBDMjU3Ljg5IDU2MCAyNDMuNTYgNTc2LjY2IDIzNS43OSA1NjBDMjEwLjkgNTA2LjY2IDI0My42IDQ3OC45MiAyMTQuNjcgNDIwQzE5NS43MSAzODEuMzggMTc1LjIyIDM5NC45OSAxNDAgMzY0LjkyQzkzLjIzIDMyNC45OSA3NC42NyAzMzIuNTIgNTAuNjkgMjgwQzIzLjMzIDIyMC4wNiAxMy40IDE5NS4wNyAzNy4zMyAxNDAiIHN0cm9rZT0icmdiYSg1MSwgMTIxLCAxOTQsIDAuNTgpIiBzdHJva2Utd2lkdGg9IjIiPjwvcGF0aD48cGF0aCBkPSJNMjMuMzMgMEMyMy4zMyAxOS4yNyA2LjA4IDUzLjg1IDAgNTMuODVDLTUuNTggNTMuODUgLTguMTQgMTguNzkgMCAwQzMuNTMgLTguMTQgMjMuMzMgLTcuNjYgMjMuMzMgMCIgc3Ryb2tlPSJyZ2JhKDUxLCAxMjEsIDE5NCwgMC41OCkiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPjxwYXRoIGQ9Ik03MDAgNTQuMTNDNjY0LjA5IDQwLjc4IDY0MS4xNiAxNS41OSA2NDEuMTYgMEM2NDEuMTYgLTExLjQ3IDY3MC41OCAwIDcwMCAwQzc3MCAwIDc3MCAwIDg0MCAwQzkwNC41MSAwIDkwNy43NSAtNi40NSA5NjkuMDIgMEM5NzcuNzUgMC45MiA5NzUuNTMgNi43MiA5ODAgMTQuNzRDMTAxNC41NCA3Ni43MiAxMDQ3LjA0IDgzLjU3IDEwNDcuMDQgMTQwQzEwNDcuMDQgMTc1LjIyIDEwMTMuMDMgMTk4LjA1IDk4MCAxOTguMDVDOTQ4LjE5IDE5OC4wNSA5NDkuMzEgMTY4LjMyIDkxNy4zNyAxNDBDODc5LjMxIDEwNi4yNiA4ODUuNDggOTEuOSA4NDAgNzMuOTNDNzc2LjggNDguOTYgNzYzLjUxIDc3Ljc0IDcwMCA1NC4xMyIgc3Ryb2tlPSJyZ2JhKDUxLCAxMjEsIDE5NCwgMC41OCkiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPjxwYXRoIGQ9Ik0xMzk2LjMyIDE0MEMxNDA5LjY4IDc5LjczIDEzMTQuNzkgNDYuMDQgMTMxNiAwQzEzMTYuNjMgLTIzLjk2IDEzNTggMCAxNDAwIDBDMTQ0My4yNCAwIDE0NTYuMzQgLTIxLjc2IDE0ODYuNDcgMEMxNTI2LjM0IDI4Ljc5IDE1MjAuMDMgNDguODcgMTU0MCAxMDEuMTFDMTU0Ni43OSAxMTguODcgMTU0MCAxMjAuNTYgMTU0MCAxNDBDMTU0MCAxNjYuOTMgMTU0Ni4yNCAxNjguMTEgMTU0MCAxOTMuODVDMTUyOS4yNyAyMzguMTEgMTUxOC43NCAyMzUuNjIgMTUwNi4wNiAyODBDMTQ4Ni40MyAzNDguNjkgMTUwNi4yNSAzNTguODcgMTQ3NS4zOCA0MjBDMTQ1My4yMiA0NjMuODcgMTQ0MC44IDQ5MCAxNDAwIDQ5MEMxMzQ4LjY2IDQ5MCAxMzQwLjc0IDQ2MC4wOSAxMjkxLjExIDQyMEMxMjcwLjc0IDQwMy41NSAxMjc4LjE5IDM3Ni45MiAxMjYwIDM3Ni45MkMxMjM3LjE4IDM3Ni45MiAxMjM4LjQ5IDQwNi4wNSAxMjA5LjA5IDQyMEMxMTY4LjQ5IDQzOS4yNiAxMTYyLjMgNDQzLjMzIDExMjAgNDQzLjMzQzExMDEuOTUgNDQzLjMzIDEwODguMzkgNDM1LjU3IDEwODguMzkgNDIwQzEwODguMzkgMzkxLjI0IDEwOTkuNDUgMzg0LjE4IDExMjAgMzU0LjY3QzExNDguMiAzMTQuMTggMTE0Ni44NSAzMDguNDUgMTE4NS44OCAyODBDMTIxNi44NSAyNTcuNDIgMTIyNy41IDI3NC4yMyAxMjYwIDI1Mi42MUMxMzMyLjcyIDIwNC4yMyAxMzgxLjY4IDIwNi4wMyAxMzk2LjMyIDE0MCIgc3Ryb2tlPSJyZ2JhKDUxLCAxMjEsIDE5NCwgMC41OCkiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPjxwYXRoIGQ9Ik0yODAgMjE2LjM2QzI1Ni40MyAyMTYuMzYgMjMwLjg4IDI0Ny43NyAyMzAuODggMjgwQzIzMC44OCAzMTMuNzMgMjU2LjQ4IDM0OC4yOSAyODAgMzQ4LjI5QzMwMi41OCAzNDguMjkgMzIzLjA4IDMxMy44IDMyMy4wOCAyODBDMzIzLjA4IDI0Ny44MyAzMDIuNTMgMjE2LjM2IDI4MCAyMTYuMzYiIHN0cm9rZT0icmdiYSg1MSwgMTIxLCAxOTQsIDAuNTgpIiBzdHJva2Utd2lkdGg9IjIiPjwvcGF0aD48cGF0aCBkPSJNNzAwIDcuNDdDNjk0LjY4IDYuMjMgNjkxLjg4IDIuMTUgNjkxLjg4IDBDNjkxLjg4IC0xLjU4IDY5NS45NCAwIDcwMCAwQzc3MCAwIDc3MCAwIDg0MCAwQzg3MC4xOSAwIDkwMC4zOSAtOC4wNCA5MDAuMzkgMEM5MDAuMzkgOS4yNyA4NzIuODYgMzMuMzggODQwIDM0LjYxQzc3Mi42NyAzNy4xMiA3NjguNzQgMjMuNTMgNzAwIDcuNDciIHN0cm9rZT0icmdiYSg1MSwgMTIxLCAxOTQsIDAuNTgpIiBzdHJva2Utd2lkdGg9IjIiPjwvcGF0aD48cGF0aCBkPSJNOTYzLjQyIDE0MEM5NjMuNDIgMTI0LjkzIDk3MS40OCAxMDYuODQgOTgwIDEwNi44NEM5ODguNjQgMTA2Ljg0IDk5Ny43NSAxMjUuMDYgOTk3Ljc1IDE0MEM5OTcuNzUgMTQ5LjMzIDk4OC43NCAxNTUuMzcgOTgwIDE1NS4zN0M5NzEuNTggMTU1LjM3IDk2My40MiAxNDkuMTkgOTYzLjQyIDE0MCIgc3Ryb2tlPSJyZ2JhKDUxLCAxMjEsIDE5NCwgMC41OCkiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPjxwYXRoIGQ9Ik0xMTEuMDMgMjgwQzExMS4wMyAyMjguMTUgMTI1LjQgMTY4IDE0MCAxNjhDMTU0LjYyIDE2OCAxNjkuNDcgMjI4LjI1IDE2OS40NyAyODBDMTY5LjQ3IDI5OC4wMiAxNTQuNjggMzA3LjU0IDE0MCAzMDcuNTRDMTI1LjQ2IDMwNy41NCAxMTEuMDMgMjk3LjkyIDExMS4wMyAyODAiIHN0cm9rZT0icmdiYSg1MSwgMTIxLCAxOTQsIDAuNTgpIiBzdHJva2Utd2lkdGg9IjIiPjwvcGF0aD48cGF0aCBkPSJNMzc2LjkyIDI4MEMzNzYuOTIgMjQyLjYxIDM4NS4wMyAxOTkuMTMgNDIwIDE5NS4xNUM0NzYuNTcgMTg4LjcxIDQ4OS40OCAyMjguMzggNTYwIDI1OS4xNUM1ODYuNyAyNzAuOCA2MTQuNDQgMjcwLjkzIDYxNC40NCAyODBDNjE0LjQ0IDI4OC43OCA1ODcuNzggMjkwLjI1IDU2MCAyOTQuODVDNDkwLjU2IDMwNi4zNCA0ODYuMjggMzE3LjU2IDQyMCAzMTIuMThDMzk0Ljc0IDMxMC4xMyAzNzYuOTIgMzAxLjEzIDM3Ni45MiAyODAiIHN0cm9rZT0icmdiYSg1MSwgMTIxLCAxOTQsIDAuNTgpIiBzdHJva2Utd2lkdGg9IjIiPjwvcGF0aD48cGF0aCBkPSJNNzU5LjM5IDQyMEM3NTkuMzkgMzg4LjY1IDgwNC41NSAzNjUuNzEgODQwIDM2NS43MUM4NjQuNDEgMzY1LjcxIDg3OS4xMiAzOTEuMDQgODc5LjEyIDQyMEM4NzkuMTIgNDU5Ljc1IDg2Ni40OCA1MDMuMTMgODQwIDUwMy4xM0M4MDYuNjIgNTAzLjEzIDc1OS4zOSA0NTcuMzYgNzU5LjM5IDQyMCIgc3Ryb2tlPSJyZ2JhKDUxLCAxMjEsIDE5NCwgMC41OCkiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPjwvZz48ZGVmcz48bWFzayBpZD0iU3ZnanNNYXNrMTAwMCI+PHJlY3Qgd2lkdGg9IjE0NDAiIGhlaWdodD0iNTYwIiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+PC9tYXNrPjwvZGVmcz48L3N2Zz4=")`
                
            }}>
                <div className="hero-overlay bg-opacity-60" ></div>
                <div className="hero-content text-center text-neutral-content w-4/5">
                    <div className="max-w-2xl ">
                        <h1 className="mb-5 text-5xl font-bold">Crea tu propia columna estratigráfica</h1>
                        {/* <p className="mb-5">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p> */}
                        <button aria-label="Comenzar" className="btn btn-primary" onClick={() => navigate('/home')}>Comenzar</button>
                    </div>
                </div>
            </div>

            {/* Contenido de la pagina */}

            <div className="hero bg-base-100 mt-1">
                <div className="my-5 w-full max-w-6xl card bg-base-300 rounded-box place-items-center">
                    <h3 className="p-1 text-5xl font-bold">Uso</h3>
                    <div className="divider w-4/5 mx-auto text-center"></div>
                    <p className="ml-8 mr-8 mx-auto text-justify">
                        Al registrarse e iniciar sesión, será visible a la página principal donde se encuentran los proyectos propios y los proyectos a los que se fue invitado a colaborar. Además en el menú de la izquierda existe un botón de proyectos públicos donde al clickearlo se redirigirá a un mapa donde se logran visualizar todos los proyectos a los que sus creadores designaron como públicos.
                        Cada proyecto propio en la lista tiene tres opciones a la derecha para editar el proyecto en la sala eliminar la sala, invitar un usuario (como lector o editor).
                        <br></br>
                        En la esquina superior de la página hay un botón "crear un nuevo proyecto", al presionar el botón se redirigirá a un formulario donde se debe
                        completar datos sobre el proyecto a crear, como la ubicación de la columna, el nombre de la sala de edición y una breve descripción, también está la opción de decidir
                        si la sala del proyecto será de acceso a lectura público o privado (en desarrollo).

                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Añadir capas</h3>
                        <br></br>
                        Lo anterior creará una sala vacía sin capas creadas y sin usuarios invitados. En la esquina superior izquierda hay un botón
                        para agregar una capa, este abre un menú en el lado derecho de la derecha de la pantalla, dentro
                        de este menú, se puede elegir agregar la capa arriba, abajo, o en una posición específica
                    </p>

                    <p className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Editar capa</h3>
                        <br></br>
                        Al hacer click a la capa creada, se abre el menú de la derecha que permite editar su contacto inferior, el patrón de la capa, 
                        el tamaño de la capa en cm, sus colores, el zoom del patrón, la rotación del patrón, la tensión de las líneas 
                        que forman los tamaños de grano, o simplemente eliminar la capa.
                    </p>

                    <p className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Editar puntos</h3>
                        <br></br>
                        Al seleccionar un punto o crear uno nuevo seleccionando un borde derecho de la capa, se hace visible un menú donde se puede elegir qué tamaño de grano va a tener ese punto de la capa, también se puede eliminar ese punto.
                    </p>

                    <p className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Añadir y editar fósiles</h3>
                        <br></br>
                        Al seleccionar la columna de fósiles, se abre un menú que permite añadir un nuevo fósil, seleccionando qué tipo de fósil, y cuáles son los límites superior e inferior en los que va a estar ese fósil (en cm). El fósil se añade en la posición donde se hizo click con el puntero. Para editar un fósil sólo se debe seleccionarlo.
                    </p>

                    <p className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Agregar/eliminar facies y tramos de facies</h3>
                        <br></br>
                        Al seleccionar el encabezado de la columna facies, se abre el menú de la derecha para agregar una nueva facie con el nombre especificado.
                        Luego de que la facie ha sido creada, se debe seleccionar la columna generada de esa facie para agregar un nuevo tramo.
                    </p>

                    <p className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Escribir en una columna</h3>
                        <br></br>
                        Al seleccionar una celda en una columna que no sea la de litología o la de fósiles, se abre un menú a la derecha que permite escribir texto en esa celda, además puedes escribir listas, imágenes, editar el texto, etc.
                        Si hay otro colaborador editanto la celda, se mostrará un borde de color, y al pasar el mouse por encima se podrá leer su identidad.
                    </p>

                    <p className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Descargar un pdf (sin terminar)</h3>
                        <br></br>
                        En la esquina superior izquierda del editor hay un botón de descarga del pdf donde se podrá editar configuraciones del pdf, como el tipo de hoja o las capas que no deberían verse, antes de descargarlo
                    </p>

                    <p className="ml-8 mr-8 mx-auto text-justify">
                        <div className="divider w-4/5 mx-auto text-center"></div>
                        <h3 className="p-1 text-3xl font-bold">Configuración de la sala</h3>
                        <br></br>
                        En la esquina superior derecha de la sala también hay un botón de configuración, al presionarlo verás el menú a la derecha
                        donde se puede ajustar la escala de las capas de tu columna, la posición de la regla y la visibilidad de as columnas de información.
                        Además puedes seleccionar un tema visual que sea de tu agrado.
                    </p>
                </div>
            </div>

            <div className="divider"></div>

            <div className="hero bg-base-100 mt-1">
                <div className="bg-base-300 p-4 rounded-md flex items-center mb-4">
                    {/* <div className="avatar">
                        <div className="w-64 rounded-full">
                            <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-3 5h3m-6 0h.01M12 16h3m-6 0h.01M10 3v4h4V3h-4Z" />
                            </svg>
                        </div>
                    </div> */}
                    <div className="ml-4">
                        <div className="flex items-center">
                            <h2 className="text-4xl font-bold">Ayúdanos a mejorar</h2>
                        </div>

                        <p className="text-2xl py-6">
                            Este proyecto está en desarrollo, déjanos saber si encontraste algún problema o tienes alguna sugerencia
                        </p>


                        <div> 
                            <div className={badgeClass('Diseño')} onClick={() => toggleBadge('Diseño')}>Diseño</div>
                            <div className={badgeClass('Rendimiento')} onClick={() => toggleBadge('Rendimiento')}>Rendimiento</div>
                            <div className={badgeClass('Funcionalidad')} onClick={() => toggleBadge('Funcionalidad')}>Funcionalidad</div>
                            <div className={badgeClass('Compatibilidad')} onClick={() => toggleBadge('Compatibilidad')}>Compatibilidad</div>
                            <div className={badgeClass('Seguridad')} onClick={() => toggleBadge('Seguridad')}>Seguridad</div>
                            <div className={badgeClass('Accesibilidad')} onClick={() => toggleBadge('Accesibilidad')}>Accesibilidad</div>
                            <div className={badgeClass('Documentación')} onClick={() => toggleBadge('Documentación')}>Documentación</div>
                            <div className={badgeClass('Registro')} onClick={() => toggleBadge('Registro')}>Registro</div>
                            <div className={badgeClass('Tecnicismos')} onClick={() => toggleBadge('Tecnicismos')}>Otros</div>
                            <div className={badgeClass('Otros')} onClick={() => toggleBadge('Otros')}>Otros</div>
                        </div>

                        <div className="mt-4">
                            <textarea 
                                aria-label="Comentarios"
                                placeholder=" " className="textarea textarea-primary w-full"
                                value={comment} 
                                onChange={(e) => setComment(e.target.value)} >
                            </textarea>
                            <button
                                onClick={() => sendComment(setMessage, selectedBadges, comment)}
                                className="btn btn-primary" aria-label="Enviar">Enviar</button>
                            {message}
                        </div>
            
                        {message}
                    </div>
                </div>
            </div>


        </div>

    )

}

export default About;