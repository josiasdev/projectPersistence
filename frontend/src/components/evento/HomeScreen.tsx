"use client";

import React, { useEffect, useState } from "react";
import { listarEventos, removerEvento, obterQuantidadeEventos, filtrarEventos, verificarIntegridade, baixarBackup } from "../../services/api";
import Logo from "../template/Logo";
import Background from "../template/Background";
import Link from "next/link";
import EventoListar from "./EventList";
import EventFilter from "./EventFilter";
import BackupEHash from "./BackupAndHash";
import TotalEvent from "./TotalEvent";

interface Evento {
    id: number;
    titulo: string;
    descricao: string;
    data: string;
    local: string;
    publicoEsperado: number;
}

const EventoList: React.FC = () => {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [filtroTitulo, setFiltroTitulo] = useState<string>("");
    const [sha256, setSha256] = useState<string | null>(null);

    const carregarEventos = async () => {
        const eventosList = await listarEventos();
        setEventos(eventosList);
    };

    const buscarEventosFiltrados = async () => {
        try {
        const eventosFiltrados = await filtrarEventos({ titulo: filtroTitulo });
        if (eventosFiltrados.length === 0) {
            setEventos([]);
        } else {
            setEventos(eventosFiltrados);
        }
    }catch (error) {
        alert("Evento não encontrado");
        setEventos([]); // Garante que a lista fique vazia em caso de erro
    }
};

    const excluirEvento = async (id: number) => {
        await removerEvento(id);
        setEventos((prev) => prev.filter((evento) => evento.id !== id));
        alert("Evento Excluido com sucesso");
    };

    const obterSha256 = async () => {
        const hash = await verificarIntegridade();
        setSha256(hash);
    };

    const baixarArquivo = async () => {
        const backupBlob = await baixarBackup();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(backupBlob);
        link.download = "backup.zip";
        link.click();
    };

    useEffect(() => {
        carregarEventos();
    }, []);

    return (
        <Background>
            <div className="justify-items-center mb-3">
                <Logo />
            </div>
            <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg">
                <EventFilter filtroTitulo={filtroTitulo} setFiltroTitulo={setFiltroTitulo} Filtrar={buscarEventosFiltrados} />
                <Link href="/evento" className="mb-4 mt-4 botao azul px-4 py-2 ">
                    Crie o seu Evento
                </Link>
                {eventos.length > 0 && (
                    <>
                        <BackupEHash sha256={sha256} onDownload={baixarArquivo} onGenerateHash={obterSha256} />
                    </>
                )}
                <TotalEvent/>
                <EventoListar eventos={eventos} Editar={() => {}} Excluir={excluirEvento} />
            </div>
        </Background>
    );
};

export default EventoList;
